import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestDB {
    public static void main(String[] args) {
        String[] urls = {
            "jdbc:postgresql://aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?prepareThreshold=0",
            "jdbc:postgresql://aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
        };
        String[] users = {
            "postgres.lztfnimlzkftrbrntugp",
            "postgres"
        };
        String pass = "nXJYgxdObZi9fFgR";

        for (String url : urls) {
            for (String user : users) {
                System.out.println("Testing URL: " + url + " | User: " + user);
                try (Connection conn = DriverManager.getConnection(url, user, pass)) {
                    System.out.println("✅ SUCCESS");
                    return;
                } catch (Exception e) {
                    System.out.println("❌ FAILED: " + e.getMessage());
                }
            }
        }
    }
}
