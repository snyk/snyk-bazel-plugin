java_library(
    name = "snyk_example_lib",
    srcs = glob(["*.java"]),
    deps = [
        "//3rdparty:guava",
        "//3rdparty:guice",
    ],
)

java_binary(
    name = "snyk_example",
    main_class = "com.snyktest.snyk_example.SnykExampleApp",
    runtime_deps = [
        ":snyk_example_lib",
    ],
)
