exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Only allow POST requests
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }

        const data = JSON.parse(event.body || '{}');
        
        // OPTION 1: Get audio URL
        if (data.getAudio) {
            // Get audio URL from environment variable
            const audioUrl = process.env.AUDIO_URL || '/audio/surprise.mp3';
            
            // Get your site URL for absolute path
            const siteUrl = process.env.URL || 'http://localhost:8888';
            
            // If it's a relative path, make it absolute
            let finalAudioUrl = audioUrl;
            if (audioUrl.startsWith('/')) {
                finalAudioUrl = `${siteUrl}${audioUrl}`;
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true,
                    audioUrl: finalAudioUrl
                })
            };
        }
        
        // OPTION 2: Password authentication
        const { password } = data;
        
        if (!password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Password is required' 
                })
            };
        }
        
        // Get master password from environment variable
        const masterPassword = process.env.MASTER_PASSWORD;
        
        if (!masterPassword) {
            console.error('MASTER_PASSWORD environment variable not set');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Server configuration error' 
                })
            };
        }
        
        const isValid = password === masterPassword;
        
        if (isValid) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Authentication successful'
                })
            };
        } else {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Oops! Try Again!!' 
                })
            };
        }

    } catch (error) {
        console.error('Authentication error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: 'Authentication failed',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};
