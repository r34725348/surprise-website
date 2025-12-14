// save-reaction.js - Save user reactions with improved logging
// Uses in-memory storage with logging to Netlify function logs

let reactions = []; // In-memory storage (resets on cold start - okay for this use case)

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
        // Parse request body
        const data = JSON.parse(event.body || '{}');
        const { reaction, timestamp } = data;

        // Validate reaction
        if (!reaction || typeof reaction !== 'string') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Valid reaction text is required' 
                })
            };
        }

        // Trim and limit reaction length
        const trimmedReaction = reaction.trim();
        if (trimmedReaction.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Reaction cannot be empty' 
                })
            };
        }

        // Limit reaction length (optional safety)
        const limitedReaction = trimmedReaction.length > 1000 
            ? trimmedReaction.substring(0, 1000) + '...' 
            : trimmedReaction;

        // Create reaction object with metadata
        const reactionData = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            reaction: limitedReaction,
            timestamp: timestamp || new Date().toISOString(),
            savedAt: new Date().toISOString(),
            ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
            userAgent: event.headers['user-agent'] || 'unknown',
            referer: event.headers.referer || 'unknown'
        };

        // Store in memory array
        reactions.push(reactionData);
        
        // Log to Netlify function logs (accessible in dashboard)
        console.log('📝 New reaction saved:', {
            id: reactionData.id,
            timestamp: reactionData.timestamp,
            reactionLength: reactionData.reaction.length,
            ip: reactionData.ip,
            preview: reactionData.reaction.length > 50 
                ? reactionData.reaction.substring(0, 50) + '...' 
                : reactionData.reaction
        });

        // Keep only last 500 reactions to prevent memory issues
        if (reactions.length > 500) {
            reactions = reactions.slice(-500);
            console.log(`📊 Reactions array trimmed to ${reactions.length} entries`);
        }

        // Success response (no confirmation shown to user as per requirements)
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Reaction saved successfully',
                id: reactionData.id,
                savedAt: reactionData.savedAt
            })
        };

    } catch (error) {
        console.error('❌ Error saving reaction:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: 'Failed to save reaction. Please try again.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};

// Helper function to get all stored reactions (for debugging)
exports.getReactions = () => {
    return reactions;
};

// Helper function to clear reactions (for debugging)
exports.clearReactions = () => {
    reactions = [];
    return { cleared: true, count: reactions.length };
};
