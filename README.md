# Privacy Cat
Cat like security against browser and device fingerprinting

![Privacy Cat](https://github.com/abrahamjuliot/privacy-cat/blob/master/privacycat_2.png)

## How does this differ from similar extensions?
1. Enforces a Proxy defense against [tampering detection](https://adtechmadness.wordpress.com/2019/03/23/javascript-tampering-detection-and-stealth)
2. Includes option to require your permission in order for scripts to read the API and complete execution
3. Detects fingerprinting in real time and outlines fingerprinting stats in the console
4. Self fingerprints each randomization output
5. Avoids unusual bahavior:
    - randomization is delayed to a minimum of 1 minute
    - userAgent randomization is within recent browser version and consistent with the system platform
    - does not inject gibberish strings in API results
6. Provides up to 8 hour delay in randomization with the option to refresh anytime
7. Settings interface is kept simple and easy