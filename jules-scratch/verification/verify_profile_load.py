import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()

        # Set a fake auth token in local storage
        await context.add_init_script("""
            localStorage.setItem('authToken', 'fake-test-token');
        """)

        page = await context.new_page()

        # Mock the API response for the user profile
        await page.route(
            "**/api/auth/me",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"success":true,"user":{"id":"123","name":"Jules Bot","email":"jules@bot.com","picture":"https://example.com/avatar.png"}}'
            )
        )

        try:
            # Navigate to the app
            await page.goto("http://localhost:5173", timeout=30000)

            # Wait for the user's name to be visible
            # Assuming the name is displayed in a div
            profile_name_locator = page.locator('div:has-text("Jules Bot")').first
            await expect(profile_name_locator).to_be_visible(timeout=15000)

            # Take a screenshot
            screenshot_path = "jules-scratch/verification/verification.png"
            await page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"An error occurred: {e}")
            # Save a screenshot even on failure for debugging
            await page.screenshot(path="jules-scratch/verification/error.png")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())