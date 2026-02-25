package iuh.fit.se.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
	}
//
//    @Bean
//    public BCryptPasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//    @Bean
//    CommandLineRunner run(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
//        return args -> {
//            if (userRepository.findByUsername("admin").isEmpty()) {
//                User admin = User.builder()
//                        .username("admin")
//                        .password(passwordEncoder.encode("123456"))
//                        .email("admin@watch.com")
//                        .fullName("Administrator")
//                        .role(Role.ADMIN)
//                        .createdAt(LocalDateTime.now())
//                        .build();
//                userRepository.save(admin);
//                System.out.println("✅ Admin user created!");
//            }
//        };
//    }

}
