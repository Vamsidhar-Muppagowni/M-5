with open('backend/services/mlService.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_method = '''
    /**
     * Recommends top-3 fertilizers based on soil/crop/nutrient data.
     * Calls the Python Flask ML service running on port 5001.
     * Falls back to a rule-based recommendation if ML service is unavailable.
     */
    async getFertilizerRecommendation(params) {
        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
        try {
            const response = await axios.post(
                `${ML_SERVICE_URL}/recommend-fertilizer`,
                params,
                { timeout: 5000 }
            );
            return response.data;
        } catch (error) {
            console.warn('[MLService] Fertilizer ML service unavailable, using fallback:', error.message);
            return this._fertilizerFallback(params);
        }
    }

    _fertilizerFallback(params) {
        const { nitrogen = 20, phosphorous = 15, potassium = 10 } = params;
        let recommendations;
        if (nitrogen > 30) {
            recommendations = [
                { rank: 1, fertilizer: 'Urea', confidence: 75.0 },
                { rank: 2, fertilizer: '28-28', confidence: 15.0 },
                { rank: 3, fertilizer: '17-17-17', confidence: 10.0 },
            ];
        } else if (phosphorous > 25) {
            recommendations = [
                { rank: 1, fertilizer: 'DAP', confidence: 70.0 },
                { rank: 2, fertilizer: '14-35-14', confidence: 20.0 },
                { rank: 3, fertilizer: '10-26-26', confidence: 10.0 },
            ];
        } else {
            recommendations = [
                { rank: 1, fertilizer: '17-17-17', confidence: 45.0 },
                { rank: 2, fertilizer: '20-20', confidence: 30.0 },
                { rank: 3, fertilizer: 'DAP', confidence: 25.0 },
            ];
        }
        return {
            success: true,
            fallback: true,
            message: 'ML service unavailable - using rule-based estimate',
            recommendations,
        };
    }
'''

# Insert the new method before the closing brace and module.exports
insert_before = '\n}\n\nmodule.exports = new MLService();'
content2 = content.replace(insert_before, new_method + '\n}\n\nmodule.exports = new MLService();', 1)

if content2 == content:
    print('WARNING: could not find insertion point, appending manually')
    content2 = content.rstrip().rstrip('}').rstrip()
    content2 += new_method + '\n}\n\nmodule.exports = new MLService();\n'

with open('backend/services/mlService.js', 'w', encoding='utf-8') as f:
    f.write(content2)
print('done')
