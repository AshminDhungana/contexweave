import os
from openai import OpenAI
from typing import Optional, Dict, List
import json

class LLMService:
    """Service for AI-powered decision and event analysis."""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-3.5-turbo"  # or gpt-4 if available
    
    def summarize_decision_timeline(self, decision_title: str, events: List[Dict]) -> str:
        """Generate AI summary of decision timeline."""
        if not events:
            return "No events recorded yet for this decision."
        
        # Format events for LLM
        event_text = "\n".join([
            f"- {e['event_type'].upper()}: {e['description']} (Source: {e.get('source', 'Unknown')})"
            for e in events
        ])
        
        prompt = f"""
Analyze this decision timeline and provide a concise executive summary (2-3 sentences).

Decision: {decision_title}

Events:
{event_text}

Summary:
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a decision analyst. Provide clear, concise insights."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=150
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Error generating summary: {str(e)}"
    
    def analyze_decision_risks(self, decision_title: str, events: List[Dict]) -> Dict:
        """Identify potential risks and opportunities."""
        if not events:
            return {"risks": [], "opportunities": []}
        
        event_text = "\n".join([
            f"- {e['event_type'].upper()}: {e['description']}"
            for e in events
        ])
        
        prompt = f"""
Analyze this decision and identify risks and opportunities.

Decision: {decision_title}

Events:
{event_text}

Respond in JSON format:
{{
    "risks": ["risk1", "risk2"],
    "opportunities": ["opportunity1", "opportunity2"],
    "confidence": "high/medium/low"
}}
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a risk analyst. Identify real, actionable risks and opportunities."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            
            # Parse JSON response
            try:
                result = json.loads(response.choices[0].message.content)
                return result
            except json.JSONDecodeError:
                return {"risks": [], "opportunities": [], "error": "Failed to parse response"}
        except Exception as e:
            return {"risks": [], "opportunities": [], "error": str(e)}
    
    def generate_next_steps(self, decision_title: str, events: List[Dict]) -> List[str]:
        """Generate recommended next steps based on decision history."""
        if not events:
            return ["Define the decision scope", "Gather more information"]
        
        event_text = "\n".join([
            f"- {e['event_type'].upper()}: {e['description']}"
            for e in events
        ])
        
        prompt = f"""
Based on this decision's timeline, what are the logical next steps?

Decision: {decision_title}

Events:
{event_text}

Provide 3-4 specific, actionable next steps. Return as a JSON list:
["step1", "step2", "step3"]
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a strategic advisor. Suggest concrete next steps."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=200
            )
            
            try:
                steps = json.loads(response.choices[0].message.content)
                return steps if isinstance(steps, list) else [response.choices[0].message.content]
            except json.JSONDecodeError:
                return [response.choices[0].message.content]
        except Exception as e:
            return [f"Error generating steps: {str(e)}"]
    
    def evaluate_decision_quality(self, decision_title: str, events: List[Dict]) -> Dict:
        """Score the quality of the decision-making process."""
        if not events:
            return {"score": 0, "feedback": "No events to evaluate"}
        
        event_text = "\n".join([
            f"- {e['event_type'].upper()}: {e['description']}"
            for e in events
        ])
        
        prompt = f"""
Score this decision's quality based on its event history (0-10 scale).

Decision: {decision_title}

Events:
{event_text}

Respond in JSON:
{{
    "score": 7,
    "reason": "explanation",
    "strengths": ["strength1"],
    "improvements": ["improvement1"]
}}
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a decision quality evaluator."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=250
            )
            
            try:
                result = json.loads(response.choices[0].message.content)
                return result
            except json.JSONDecodeError:
                return {"score": 0, "error": "Failed to parse response"}
        except Exception as e:
            return {"score": 0, "error": str(e)}
