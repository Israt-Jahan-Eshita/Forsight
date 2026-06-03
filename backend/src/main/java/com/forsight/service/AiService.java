package com.forsight.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.forsight.model.Resource;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

@Service
public class AiService {

    @Value("${grok.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateNotes(Resource resource) {
        String mediaType = detectMediaType(resource);
        String prompt;

        if ("video".equals(mediaType)) {
            prompt = "Generate comprehensive, highly structured study notes based on this educational video lecture:\n" +
                    "Subject: " + (resource.getCourse() != null ? resource.getCourse().getName() : "Unknown") + "\n" +
                    "Class Group: " + (resource.getCourse() != null ? resource.getCourse().getClassName() : "Unknown") + "\n" +
                    "Video Title: " + resource.getTitle() + "\n" +
                    "Lecture Summary: " + (resource.getDescription() != null ? resource.getDescription() : "Educational video") + "\n\n" +
                    "Based on the lecture summary above, generate detailed study notes covering all key concepts, definitions, formulas, and examples that would be covered in this video lecture. " +
                    "Format the output beautifully using Markdown with headers, bullet points, and highlighted key terms.";
        } else if ("audio".equals(mediaType)) {
            prompt = "Generate comprehensive, highly structured study notes based on this educational audio recording:\n" +
                    "Subject: " + (resource.getCourse() != null ? resource.getCourse().getName() : "Unknown") + "\n" +
                    "Class Group: " + (resource.getCourse() != null ? resource.getCourse().getClassName() : "Unknown") + "\n" +
                    "Audio Title: " + resource.getTitle() + "\n" +
                    "Recording Summary: " + (resource.getDescription() != null ? resource.getDescription() : "Educational audio") + "\n\n" +
                    "Based on the recording summary above, generate detailed study notes covering all key concepts, definitions, and examples discussed in this audio lecture. " +
                    "Format the output beautifully using Markdown with headers, bullet points, and highlighted key terms.";
        } else {
            prompt = "Generate comprehensive, highly structured, and visually beautiful study notes for this topic:\n" +
                    "Subject: " + (resource.getCourse() != null ? resource.getCourse().getName() : "Unknown") + "\n" +
                    "Class Group: " + (resource.getCourse() != null ? resource.getCourse().getClassName() : "Unknown") + "\n" +
                    "Resource Title: " + resource.getTitle() + "\n" +
                    "Description: " + (resource.getDescription() != null ? resource.getDescription() : "Study guide") + "\n\n" +
                    "Please format the output beautifully using standard Markdown. Include key concepts, detailed bullet definitions, summaries, and relevant equations/formulas. Keep it clear, elegant, and highly educational.";
        }

        return callGrok("You are Forsight AI, a brilliant and supportive educational assistant.", prompt, resource);
    }

    public String chatAboutResource(Resource resource, String message, String historyJson) {
        String mediaType = detectMediaType(resource);
        String mediaLabel = "video".equals(mediaType) ? "video lecture" : ("audio".equals(mediaType) ? "audio recording" : "study guide");

        String systemPrompt = "You are Forsight AI, an educational tutor strictly bound to the study material provided below. " +
                "CRITICAL RULES: " +
                "1. You must ONLY answer questions that are directly related to the provided study material content. " +
                "2. If the student asks a question that is NOT covered in or related to this material, you MUST politely refuse by saying: " +
                "'I can only help with questions related to your current study material. Please ask something about the topics covered in this document.' " +
                "3. Do NOT answer general knowledge questions, coding questions, or anything outside the scope of the attached document. " +
                "4. Keep your tone warm, clear, and encouraging. Use Markdown formatting for clarity.";
        
        String userPrompt = "We are discussing a " + mediaLabel + ":\n" +
                "Title: " + resource.getTitle() + "\n" +
                "Subject: " + (resource.getCourse() != null ? resource.getCourse().getName() : "Unknown") + "\n" +
                "Class: " + (resource.getCourse() != null ? resource.getCourse().getClassName() : "Unknown") + "\n" +
                "Description: " + (resource.getDescription() != null ? resource.getDescription() : "") + "\n\n" +
                "Conversation History:\n" + historyJson + "\n\n" +
                "User's new question: " + message;

        return callGrok(systemPrompt, userPrompt, resource);
    }

    public String generateQuiz(String prompt, Resource resource) {
        String systemPrompt = "You are Forsight AI, an expert educational assessment creator. Generate a practice quiz EXACTLY following the teacher's instructions in the prompt.\n" +
                "CRITICAL RULES:\n" +
                "1. You MUST ONLY generate questions based on the 'extracted context from the study resource' provided below. If the context has nothing to do with biology, DO NOT generate biology questions.\n" +
                "2. If no context is provided to you, you MUST politely state: 'I could not find the resource context. Please ensure the resource is attached.' and generate NO questions.\n" +
                "3. If the teacher asks for specific question types (e.g., 5 MCQs, 2 CQ), generate exactly what they requested.\n" +
                "4. ALWAYS include a detailed answer key at the very end.\n" +
                "5. Format beautifully using standard Markdown.";
        return callGrok(systemPrompt, prompt, resource);
    }

    public String generateText(String systemPrompt, String userPrompt) {
        return callGrok(systemPrompt, userPrompt, null);
    }

    private String callGrok(String systemPrompt, String userPrompt, Resource resource) {
        try {
            String context = extractResourceContext(resource);
            System.out.println("DEBUG AiService callGrok: Extracted context length = " + context.length());
            
            if (!context.isEmpty()) {
                userPrompt += "\n\nHere is the extracted context from the study resource:\n" + context;
            } else {
                System.out.println("DEBUG AiService callGrok: WARNING - Context is empty!");
            }

            ObjectNode rootNode = objectMapper.createObjectNode();
            rootNode.put("model", "llama-3.1-8b-instant");
            ArrayNode messagesArray = rootNode.putArray("messages");

            ObjectNode sysMsg = messagesArray.addObject();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);

            ObjectNode usrMsg = messagesArray.addObject();
            usrMsg.put("role", "user");
            usrMsg.put("content", userPrompt);

            String jsonPayload = objectMapper.writeValueAsString(rootNode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<String> requestEntity = new HttpEntity<>(jsonPayload, headers);
            RestTemplate restTemplate = new RestTemplate();
            
            ResponseEntity<String> responseEntity = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/chat/completions",
                    requestEntity,
                    String.class
            );

            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                JsonNode root = objectMapper.readTree(responseEntity.getBody());
                return root.path("choices").get(0).path("message").path("content").asText();
            } else {
                System.err.println("Groq API Error: " + responseEntity.getStatusCode());
                return "AI assistant was unable to resolve response from Groq servers. Please verify your API key.";
            }

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("Groq Client Error: " + e.getResponseBodyAsString());
            return "AI assistant was unable to resolve response from Groq servers: " + e.getStatusCode();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error parsing document context for AI: " + e.getMessage();
        }
    }

    private String extractResourceContext(Resource resource) {
        if (resource == null) {
            return "";
        }
        
        String fileType = resource.getFileType();
        if (fileType != null && fileType.contains("pdf")) {
            if (resource.getFileData() == null || resource.getFileData().length == 0) return "";
            try (PDDocument document = Loader.loadPDF(resource.getFileData())) {
                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(document);
                // Truncate to ~8,000 characters to allow multiple requests (Notes + Chat) within Groq's 6000 Tokens Per Minute limit.
                if (text.length() > 8000) {
                    return text.substring(0, 8000) + "\n...[Content Truncated due to Groq Free Tier Limits]...";
                }
                return text;
            } catch (Exception e) {
                System.err.println("Failed to extract PDF text: " + e.getMessage());
                return "";
            }
        } else if (fileType != null && (fileType.contains("video") || fileType.contains("audio"))) {
            return resource.getDescription() != null ? resource.getDescription() : "";
        }
        return "";
    }

    /**
     * Detects the media type of a resource based on its fileType field.
     * Returns "pdf", "video", "audio", or "other".
     */
    private String detectMediaType(Resource resource) {
        if (resource == null || resource.getFileType() == null) return "other";
        String ft = resource.getFileType().toLowerCase();
        if (ft.contains("pdf")) return "pdf";
        if (ft.contains("video") || ft.contains("mp4") || ft.contains("webm")) return "video";
        if (ft.contains("audio") || ft.contains("mp3") || ft.contains("wav") || ft.contains("mpeg")) return "audio";
        return "other";
    }
}
