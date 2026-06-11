pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    // معطل كما طلبت
    // id("dev.flutter.flutter-plugin-loader") version "1.0.0"
    id("com.android.application") version "8.1.1" apply false
    id("org.jetbrains.kotlin.android") version "2.0.0" apply false
}

// --- أضف الأسطر التالية هنا لتعريف Capacitor ---
include(":app")
include(":capacitor-android")
project(":capacitor-android").projectDir = File("../node_modules/@capacitor/android/capacitor")
// -------------------------------------------
// -------------------------------------------
