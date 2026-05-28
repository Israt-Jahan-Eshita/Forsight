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

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@Service
public class AiService {

    @Value("${grok.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateNotes(Resource resource) {
        String prompt = "Generate comprehensive, highly structured, and visually beautiful study notes for this topic:\n" +
                "Subject: " + resource.getSubject() + "\n" +
                "Class Group: " + resource.getClassName() + "\n" +
                "Resource Title: " + resource.getTitle() + "\n" +
                "Description: " + (resource.getDescription() != null ? resource.getDescription() : "Study guide") + "\n\n" +
                "Please format the output beautifully using standard Markdown. Include key concepts, detailed bullet definitions, summaries, and relevant equations/formulas. Keep it clear, elegant, and highly educational.";

        return callGrok("You are Forsight AI, a brilliant and supportive educational assistant.", prompt, resource);
    }

    public String chatAboutResource(Resource resource, String message, String historyJson) {
        String systemPrompt = "You are Forsight AI, an interactive educational companion. Provide a helpful, concise, and academically sound explanation using Markdown formatting. Keep the tone warm, clear, and encouraging.";
        
        String userPrompt = "We are discussing a study guide:\n" +
                "Title: " + resource.getTitle() + "\n" +
                "Subject: " + resource.getSubject() + "\n" +
                "Class: " + resource.getClassName() + "\n" +
                "Description: " + (resource.getDescription() != null ? resource.getDescription() : "") + "\n\n" +
                "Conversation History:\n" + historyJson + "\n\n" +
                "User's new question: " + message;

        return callGrok(systemPrompt, userPrompt, resource);
    }



    private String callGrok(String systemPrompt, String userPrompt, Resource resource) {
        try {
            URL url = new URL("https://api.groq.com/openai/v1/chat/completions");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setDoOutput(true);

            String pdfContent = extractPdfText(resource);
            if (!pdfContent.isEmpty()) {
                userPrompt += "\n\nHere is the extracted text from the study guide document for context:\n" + pdfContent;
            }

            // Construct JSON Payload using Jackson
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

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                StringBuilder response = new StringBuilder();
                try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                    String responseLine;
                    while ((responseLine = br.readLine()) != null) {
                        response.append(responseLine.trim());
                    }
                }

                // Parse response with Jackson
                JsonNode root = objectMapper.readTree(response.toString());
                return root.path("choices")
                        .get(0)
                        .path("message")
                        .path("content")
                        .asText();
            } else {
                // If API throws an error, fallback gracefully
                StringBuilder errorResponse = new StringBuilder();
                try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
                    String line;
                    if (br != null) {
                        while ((line = br.readLine()) != null) {
                            errorResponse.append(line.trim());
                        }
                    }
                } catch (Exception e) {
                    errorResponse.append("Failed to read error stream.");
                }
                System.err.println("Groq API Error: " + responseCode + " - " + errorResponse.toString());
            }

            return "AI assistant was unable to resolve response from Groq servers. Please verify your API key.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error parsing document context for AI: " + e.getMessage();
        }
    }

    private String extractPdfText(Resource resource) {
        if (resource == null || resource.getFileData() == null || resource.getFileData().length == 0) {
            return "";
        }
        
        String fileType = resource.getFileType();
        if (fileType != null && fileType.contains("pdf")) {
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
            }
        }
        return "";
    }

}
