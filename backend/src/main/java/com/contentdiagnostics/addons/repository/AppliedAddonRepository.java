package com.contentdiagnostics.addons.repository;

import com.contentdiagnostics.addons.entity.AppliedAddon;
import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.jobs.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppliedAddonRepository extends JpaRepository<AppliedAddon, Long> {
    List<AppliedAddon> findByCreatorOrderByAppliedAtDesc(User creator);
    List<AppliedAddon> findByJob(Job job);
    List<AppliedAddon> findByCreatorAndStatusOrderByAppliedAtDesc(User creator, AppliedAddon.AppliedAddonStatus status);
}
