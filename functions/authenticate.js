// authenticate.js - Password authentication and audio URL serving
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

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: 'Method not allowed. Use POST.' 
            })
        };
    }

    try {
        const data = JSON.parse(event.body || '{}');
        
        // ===== OPTION 1: GET AUDIO URL =====
        if (data.getAudio) {
            // Get audio URL from environment variable
            const audioUrl = process.env.AUDIO_URL || '/audio/surprise.mp3';
            
            // Get site URL for absolute path
            let siteUrl = process.env.URL || 'https://your-site.netlify.app';
            
            // If URL env is not set, construct from headers
            if (!process.env.URL && event.headers.host) {
                const protocol = event.headers['x-forwarded-proto'] || 'https';
                siteUrl = `${protocol}://${event.headers.host}`;
            }
            
            // If it's a relative path, make it absolute
            let finalAudioUrl = audioUrl;
            if (audioUrl.startsWith('/')) {
                finalAudioUrl = `${siteUrl}${audioUrl}`;
            }
            
            console.log('Audio URL requested:', {
                audioUrl,
                finalAudioUrl,
                siteUrl
            });
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true,
                    audioUrl: finalAudioUrl,
                    message: 'Audio URL retrieved successfully'
                })
            };
        }
        
        // ===== OPTION 2: PASSWORD AUTHENTICATION =====
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
        
        // Debug logging (visible in Netlify function logs)
        console.log('Password check:', {
            hasMasterPassword: !!masterPassword,
            inputLength: password.length,
            inputFirstChars: password.substring(0, 3) + '...'
        });
        
        if (!masterPassword) {
            console.error('MASTER_PASSWORD environment variable is not set');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Server configuration error. Please contact administrator.' 
                })
            };
        }
        
        const isValid = password === masterPassword;
        
        if (isValid) {
            console.log('Password authentication SUCCESS for input:', password);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Authentication successful! Preparing your surprise...'
                })
            };
        } else {
            console.log('Password authentication FAILED for input:', password);
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
                error: 'Authentication failed due to server error',
                details: process.env.NODE_ENV === 'development' ? error.message : 'Contact support'
            })
        };
    }
};
