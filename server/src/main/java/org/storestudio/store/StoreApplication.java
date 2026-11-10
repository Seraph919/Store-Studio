package org.storestudio.store;

import org.storestudio.store.services.AdminService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class StoreApplication {

    public static void main(String[] args) {

        SpringApplication.run(StoreApplication.class, args);
    }

}
