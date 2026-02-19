import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView
} from 'react-native';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return ( <
                View style = {
                    styles.container
                } >
                <
                ScrollView style = {
                    styles.scrollView
                } >
                <
                Text style = {
                    styles.title
                } > Something went wrong. < /Text> <
                Text style = {
                    styles.errorText
                } > {
                    this.state.error && this.state.error.toString()
                } < /Text> <
                Text style = {
                    styles.stackText
                } > {
                    this.state.errorInfo && this.state.errorInfo.componentStack
                } < /Text> <
                /ScrollView> <
                /View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'red',
        marginBottom: 10,
    },
    errorText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
    },
    stackText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    }
});

export default ErrorBoundary;