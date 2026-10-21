RAG_SYNTHESIS_PROMPT_TEMPLATE = """You are answering a user query using the following VERIFIED CLINICAL DOCUMENTS.

[USER QUERY]: {query}
[USER LANGUAGE]: {language}

[RETRIEVED CLINICAL DATA ENVELOPE]:
{context_envelope}

INSTRUCTIONS:
1. Generate an answer strictly adhering to the information in the retrieved envelope above.
2. Structure your response with:
   - Concise summary
   - Clinical / Ayurvedic indications
   - Safety, precautions & known interactions
   - Verified Sources & Citations
3. If the retrieved context is insufficient or irrelevant, state:
   "I could not find sufficiently reliable clinical information in the MedInVedic knowledge base for this query. Please consult a qualified doctor or healthcare specialist."
4. Translate and respond in {language}.
"""
