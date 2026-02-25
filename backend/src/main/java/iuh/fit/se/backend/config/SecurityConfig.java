package iuh.fit.se.backend.config;

import iuh.fit.se.backend.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationFilter jwtAuthenticationFilter,
                                                   AuthenticationProvider authenticationProvider) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // tắt CSRF cho API
                .cors(cors -> {
                }) // Bật CORS để dùng CorsConfig
                .authorizeHttpRequests(auth -> auth
                                // Swagger/OpenAPI - Public
                                .requestMatchers(
                                        "/v3/api-docs/**",
                                        "/swagger-ui.html",
                                        "/swagger-ui/**",
                                        "/swagger-resources/**",
                                        "/webjars/**"
                                ).permitAll()

                                // Auth endpoints - Public
                                .requestMatchers("/api/auth/**").permitAll()

                                .requestMatchers(HttpMethod.GET, "/api/banners/**").permitAll()
                                                                // AI endpoint - allow unauthenticated usage for public AI queries
                                                                .requestMatchers("/api/ai/**").permitAll()
                                
                                .requestMatchers(HttpMethod.GET, "/api/post-categories/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()

                                // WebSocket - Authenticated users only
                                .requestMatchers("/ws/**").permitAll() // Allow WebSocket handshake
                                .requestMatchers("/api/chat/**").authenticated() // Chat API requires authentication

//                        cart
                                .requestMatchers(HttpMethod.GET, "/api/cart/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/cart/**").permitAll()
                                .requestMatchers(HttpMethod.PUT, "/api/cart/**").permitAll()
                                .requestMatchers(HttpMethod.DELETE, "/api/cart/**").permitAll()

                                // Products - GET public, modifications need ADMIN
                                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                                // Categories - GET public, modifications need ADMIN
                                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")

                                // Brands - GET public, modifications need ADMIN
                                .requestMatchers(HttpMethod.GET, "/api/brands/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/brands/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/brands/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/brands/**").hasRole("ADMIN")

                                // Suppliers - GET public, modifications need ADMIN
                                .requestMatchers(HttpMethod.GET, "/api/suppliers/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/suppliers/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/suppliers/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/suppliers/**").hasRole("ADMIN")

                                // Reviews - GET public, POST/PUT authenticated users, DELETE ADMIN only
                                .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/reviews").authenticated() // Users can create reviews
                                .requestMatchers(HttpMethod.PUT, "/api/reviews/**").authenticated() // Users can update their reviews
                                .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").hasRole("ADMIN") // Only ADMIN can delete

                        // Orders - Users can create and view their orders, ADMIN can manage all
                        .requestMatchers(HttpMethod.POST, "/api/orders").authenticated()  // Users can create orders
                        .requestMatchers(HttpMethod.GET, "/api/orders/user/**").authenticated()  // Users can view their orders (must be before /api/orders/**)
                        .requestMatchers(HttpMethod.POST, "/api/orders/*/cancel").authenticated()  // Users can cancel their own orders (controller will verify ownership)
                        .requestMatchers("/api/orders/**").hasRole("ADMIN")  // ADMIN can manage all orders

                        // Promotions - GET public, modifications need ADMIN
                        .requestMatchers(HttpMethod.GET, "/api/promotions/**").permitAll()
                        .requestMatchers("/api/promotions/**").hasRole("ADMIN")

                        // VNPay Payment Gateway - Public endpoints (PHẢI đặt trước rule payment tổng quát)
                        .requestMatchers(HttpMethod.POST, "/api/payments/create-payment").permitAll() // Tạo thanh toán VNPay
                        .requestMatchers(HttpMethod.GET, "/api/payments/vnpay-return").permitAll() // VNPay callback
                        .requestMatchers(HttpMethod.GET, "/api/payments/vnpay-ipn").permitAll() // VNPay IPN

                        // Payments - GET public, CRUD operations require ADMIN
                        .requestMatchers(HttpMethod.GET, "/api/payments/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/payments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/payments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/payments/**").hasRole("ADMIN")

                                // Settings - GET public (for Footer), PUT ADMIN only
                                .requestMatchers(HttpMethod.GET, "/api/settings/**").permitAll()
                                .requestMatchers("/api/settings/**").hasRole("ADMIN")

                                // Allow authenticated users to upload their avatar, keep other upload endpoints ADMIN-only
                                .requestMatchers(HttpMethod.POST, "/api/upload/avatar").authenticated()
                                // Upload - ADMIN only for other upload operations
                                .requestMatchers("/api/upload/**").hasRole("ADMIN")

                                // Admin endpoints - ADMIN only

                                .requestMatchers("/api/inventories/**").hasRole("ADMIN")

                                // All other requests need authentication
                                .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    @SuppressWarnings("deprecation")
    public AuthenticationProvider authenticationProvider(CustomUserDetailsService userDetailsService) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
