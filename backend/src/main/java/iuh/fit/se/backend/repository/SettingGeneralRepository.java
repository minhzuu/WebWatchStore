package iuh.fit.se.backend.repository;

import iuh.fit.se.backend.entity.SettingGeneral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettingGeneralRepository extends JpaRepository<SettingGeneral, Long> {
}
