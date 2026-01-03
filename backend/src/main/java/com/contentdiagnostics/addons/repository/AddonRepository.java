package com.contentdiagnostics.addons.repository;

import com.contentdiagnostics.addons.entity.Addon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddonRepository extends JpaRepository<Addon, Long> {
    List<Addon> findByActiveTrue();
    Optional<Addon> findByCode(String code);
}
