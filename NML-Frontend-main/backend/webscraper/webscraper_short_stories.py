from selenium import webdriver
import time


def scroll_to_bottom(driver, pause_time): # Have to manually scroll to the bottom, because this spaghetti code doesn't work
    last_height = driver.execute_script("return document.body.scrollHeight")

    while True:
        # Scroll down to bottom
        driver.execute_script("window.scrollBy(0, document.body.scrollHeight);")

        # Wait to load page
        time.sleep(pause_time)

        # Calculate new scroll height and compare with last scroll height
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height


url = "https://www.libraryofshortstories.com/stories"

driver = webdriver.Firefox()
driver.get(url)
scroll_to_bottom(driver, 60)
html = driver.page_source
driver.quit()
with open("short_stories.html", "w", encoding="utf-8") as f:
    f.write(html)
