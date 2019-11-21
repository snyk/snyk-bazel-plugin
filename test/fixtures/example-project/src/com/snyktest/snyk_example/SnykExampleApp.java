package com.snyktest.snyk_example;

import com.google.inject.Guice;
import com.google.inject.Injector;

public class SnykExampleApp {
    public static void main(String[] args) throws Exception {
        Injector injector = Guice.createInjector(new SnykExampleModule());

        System.out.println("Hello Snyk!");
    }
}
