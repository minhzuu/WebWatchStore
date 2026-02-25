package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.Order;
import iuh.fit.se.backend.entity.OrderItem;
import iuh.fit.se.backend.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@watchstore.local}")
    private String fromEmail;

    // Gửi email đăng ký
    public void sendRegistrationEmail(String to, String fullName) {
        try {
            String subject = "Chào mừng đến với Watch Store";
            String text = String.format(
                    "Xin chào %s,\n\nCám ơn bạn đã đăng ký tài khoản tại Watch Store.\n\nTrân trọng,\nWatch Store Team",
                    fullName != null ? fullName : ""
            );

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            if (StringUtils.hasText(fromEmail)) message.setFrom(fromEmail);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
            log.info("Sent registration email to {}", to);
        } catch (MailException e) {
            log.error("Failed to send registration email to {}", to, e);
        }
    }

    // Gửi email reset password
    public void sendPasswordResetEmail(String to, String fullName, String token, String frontendBaseUrl) {
        try {
            String subject = "Yêu cầu đặt lại mật khẩu - Watch Store";
            String resetUrl = String.format("%s/reset-password?token=%s", frontendBaseUrl, token);
            String text = String.format(
                    "Xin chào %s,\n\nChúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n" +
                            "Để đặt lại mật khẩu, vui lòng truy cập link sau (hết hạn trong 1 giờ):\n%s\n\n" +
                            "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.\n\nTrân trọng,\nWatch Store Team",
                    fullName != null ? fullName : "", resetUrl
            );

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            if (StringUtils.hasText(fromEmail)) message.setFrom(fromEmail);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
            log.info("Sent password reset email to {}", to);
        } catch (MailException e) {
            log.error("Failed to send password reset email to {}", to, e);
        }
    }

    // Gửi email xác nhận đơn hàng
    public void sendOrderConfirmationEmail(Order order) {
        if (order == null) {
            log.warn("Skipping order confirmation email because order is null");
            return;
        }

        User user = order.getUser();
        if (user == null || !StringUtils.hasText(user.getEmail())) {
            log.warn("Skipping email for order {} because user email is missing", order.getId());
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            if (StringUtils.hasText(fromEmail)) message.setFrom(fromEmail);
            message.setSubject(String.format("[Watch Store] Xác nhận đơn hàng #%s", order.getId()));
            message.setText(buildEmailBody(order));

            mailSender.send(message);
            log.info("Sent order confirmation email for order {}", order.getId());
        } catch (MailException e) {
            log.error("Failed to send order confirmation email for order {}", order.getId(), e);
        }
    }

    private String buildEmailBody(Order order) {
        StringBuilder body = new StringBuilder();
        body.append("Xin chào ").append(
                        StringUtils.hasText(order.getFullName()) ? order.getFullName() : "quý khách"
                ).append(",\n\n");
        body.append("Cảm ơn bạn đã đặt hàng tại Watch Store. Thông tin đơn hàng của bạn:\n");
        body.append(String.format("Mã đơn hàng: #%s\n", order.getId()));

        if (StringUtils.hasText(order.getAddress())) {
            body.append("Địa chỉ giao hàng: ")
                    .append(order.getAddress());
            if (StringUtils.hasText(order.getWard())) body.append(", ").append(order.getWard());
            if (StringUtils.hasText(order.getDistrict())) body.append(", ").append(order.getDistrict());
            if (StringUtils.hasText(order.getCity())) body.append(", ").append(order.getCity());
            body.append("\n");
        }

        body.append("\nSản phẩm:\n");
        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> items = order.getOrderItems() == null ? List.of() : order.getOrderItems();
        for (OrderItem item : items) {
            BigDecimal lineTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(lineTotal);
            body.append(String.format("- %s x%d: %s VND\n",
                    item.getProductName(),
                    item.getQuantity(),
                    lineTotal.toPlainString()));
        }

        body.append(String.format("\nTổng cộng: %s VND\n", total.toPlainString()));
        body.append("Phương thức thanh toán: ")
                .append(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "Chưa xác định")
                .append("\n");

        body.append("\nChúng tôi sẽ liên hệ lại khi đơn hàng được xử lý.\n");
        body.append("Trân trọng,\nWatch Store");

        return body.toString();
    }
}
