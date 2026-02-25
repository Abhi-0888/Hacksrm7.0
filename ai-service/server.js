const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock AI analysis endpoint
app.post('/analyze', (req, res) => {
    const { title, description, amount } = req.body;

    // Simple scoring algorithm based on content quality
    let score = 50; // Base score

    // Title quality
    if (title && title.length > 10) score += 10;
    if (title && title.length > 30) score += 5;

    // Description quality
    if (description && description.length > 50) score += 15;
    if (description && description.length > 200) score += 10;

    // Amount reasonableness (between 0.1 and 10 ETH)
    if (amount >= 0.1 && amount <= 10) score += 10;

    // Generate suggestions based on analysis
    const suggestions = [];

    if (!title || title.length < 20) {
        suggestions.push('Consider making your title more descriptive and engaging.');
    }

    if (!description || description.length < 100) {
        suggestions.push('Add more details to your description to help voters understand your proposal better.');
    }

    if (amount > 10) {
        suggestions.push('The requested amount seems high. Consider breaking this into multiple smaller proposals.');
    }

    if (amount < 0.1) {
        suggestions.push('The requested amount seems low. Make sure it covers all necessary expenses.');
    }

    if (!description?.includes('budget') && !description?.includes('cost')) {
        suggestions.push('Include a detailed budget breakdown to increase transparency.');
    }

    if (!description?.includes('date') && !description?.includes('when')) {
        suggestions.push('Specify the event date or timeline for better planning.');
    }

    // Cap score at 100
    score = Math.min(score, 100);

    res.json({
        score,
        suggestions: suggestions.length > 0 ? suggestions : ['Your proposal looks good! Consider adding more specific details about the event timeline and expected outcomes.']
    });
});

// Mock proposal comparison endpoint
app.post('/api/ai/proposal-comparison', (req, res) => {
    const { title, description, amount } = req.body;

    // Mock comparison logic
    const amountNum = parseFloat(amount);
    let insight = '';
    let matchType = 'similar';

    if (amountNum < 1) {
        insight = 'This proposal is below average funding requests. Most successful events receive 1-5 ETH.';
        matchType = 'budget';
    } else if (amountNum >= 1 && amountNum <= 5) {
        insight = 'This proposal aligns with typical campus event budgets. Similar events have a 75% approval rate.';
        matchType = 'budget';
    } else {
        insight = 'This is a high-budget proposal. Consider providing detailed justification for the requested amount.';
        matchType = 'premium';
    }

    // Check for event type keywords
    if (title?.toLowerCase().includes('hackathon') || description?.toLowerCase().includes('hackathon')) {
        insight = 'Hackathons typically receive strong community support. Average funding: 3-7 ETH with 85% approval rate.';
        matchType = 'hackathon';
    } else if (title?.toLowerCase().includes('workshop') || description?.toLowerCase().includes('workshop')) {
        insight = 'Workshops are popular on campus. Similar proposals average 1-3 ETH with 70% approval rate.';
        matchType = 'workshop';
    } else if (title?.toLowerCase().includes('fest') || description?.toLowerCase().includes('festival')) {
        insight = 'Campus festivals are high-engagement events. Typical funding ranges from 5-10 ETH with 80% approval rate.';
        matchType = 'festival';
    }

    res.json({
        insight,
        matchType,
        confidence: 0.85
    });
});

app.listen(PORT, () => {
    console.log(`🤖 AI Service running on http://localhost:${PORT}`);
});
