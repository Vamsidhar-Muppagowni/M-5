exports.calculateShipping = async (req, res) => {
    res.json({ cost: 500, estimated_days: 2 });
};

exports.trackShipment = async (req, res) => {
    res.json({ status: 'in_transit', location: 'District Hub' });
};
