const headerPrompt: string = "Header Details: Mention any logos, navigation menus, search bars, and additional elements in the header.";
const mainContentPrompt: string = "Main Content: Describe the primary content, including text, images, videos, and other media. Mention specific text content, font styles, and sizes.";
const sidebarContentPrompt: string = "Sidebar Content: Detail any sidebar content such as ads, additional navigation links, or featured articles.";
const footerDetailsPrompt: string = "Footer Details: Include descriptions of footer content like copyright information, additional navigation, and social media links.";
const interactiveElementsPrompt: string = "Interactive Elements: Note any buttons, links, forms, or other interactive elements and their states (e.g., hover effects).";
const colorsAndThemesPrompt: string = "Colors and Themes: Describe the color scheme, background colors, and any thematic elements.";
const additionalDetailsPrompt: string = "Additional Details: Include any pop-ups, notifications, or other dynamic elements visible in the screenshot.";

const examplePrompt: string = `The webpage screenshot displays a well-organized layout with a prominent header, main content area, sidebar, and footer.
Header: The header includes a logo at the top-left corner, a navigation menu with links to "Home," "About Us," "Services," "Blog," and "Contact," and a search bar at the top-right corner.
Logo: Positioned at the top-left corner, featuring a blue and white logo with the text "WebSiteName" in bold.
Navigation Menu: To the right of the logo, a horizontal navigation menu includes links labeled "Home," "About Us," "Services," "Blog," and "Contact." Each link is styled with a sans-serif font, medium size, and turns bold with an underline on hover.
Search Bar: Located at the top-right corner, the search bar has a placeholder text "Search..." and a magnifying glass icon.
Main Content Area:
Hero Section: Spanning the top of the main content, a large banner image of a cityscape with an overlaying text "Welcome to Our Website" in white, bold, and a larger font size. Below this, a smaller subtitle reads "Your source for the latest updates" in italic.
Article Section: Below the hero section, a two-column layout displays the latest articles. Each column features a thumbnail image on the left, with an article title in bold, a snippet of text, and a "Read More" link in blue on the right.
Embedded Video: Further down, an embedded YouTube video player showcases a featured video with a play button overlay`;

const examplePrompt2: string = `
The webpage screenshot displays a well-organized layout with a prominent header, main content area, sidebar, and footer.
             Header:
             Logo: Positioned at the top-left corner, featuring a blue and white logo with the text "WebSiteName" in bold.
             Navigation Menu: To the right of the logo, a horizontal navigation menu includes links labeled "Home," "About Us," "Services," "Blog," and "Contact." Each link is styled with a sans-serif font, medium size, and turns bold with an underline on hover.
             Search Bar: Located at the top-right corner, the search bar has a placeholder text "Search..." and a magnifying glass icon.
             Main Content Area:

             Hero Section: Spanning the top of the main content, a large banner image of a cityscape with an overlaying text "Welcome to Our Website" in white, bold, and a larger font size. Below this, a smaller subtitle reads "Your source for the latest updates" in italic.
             Article Section: Below the hero section, a two-column layout displays the latest articles. Each column features a thumbnail image on the left, with an article title in bold, a snippet of text, and a "Read More" link in blue on the right.
             Embedded Video: Further down, an embedded YouTube video player showcases a featured video with a play button overlay.
             Sidebar:
             
             Ads: The top of the sidebar features a rectangular ad banner with animated content promoting a sale on electronics.
             Popular Posts: Below the ad, a list of links to popular blog posts with thumbnail images and brief descriptions.
             Footer:
             
             Social Media Links: Icons for Facebook, Twitter, Instagram, and LinkedIn are positioned on the left, each in their respective brand colors.
             Additional Links: On the right, smaller text links include "Privacy Policy," "Terms of Service," and "Sitemap."
             Copyright Information: Centered at the bottom, a text reads "© 2024 WebSiteName. All rights reserved."
             Interactive Elements:
             
             Buttons: The "Contact" button in the navigation menu is highlighted with a green background and white text. On hover, the background color changes to a darker green.
             Form Elements: A newsletter signup form in the footer includes text fields for "Name" and "Email," and a "Subscribe" button in blue.
             Colors and Themes:
             
             Primary Colors: The website uses a palette of blue, white, and grey. The background color is a light grey, with content areas in white and text in dark grey.
             Font Styles: The primary font is a modern sans-serif, with headers in bold and body text in regular weight.
             Additional Details:
             
             Pop-up Notification: A small pop-up at the bottom-right corner offers a discount code for new subscribers, with a close button in the top-right corner of the pop-up.
             The webpage screenshot displays a well-organized layout with a prominent header, main content area, sidebar, and footer.

             Header:
             
             Logo: Positioned at the top-left corner, featuring a blue and white logo with the text "WebSiteName" in bold.
             Navigation Menu: To the right of the logo, a horizontal navigation menu includes links labeled "Home," "About Us," "Services," "Blog," and "Contact." Each link is styled with a sans-serif font, medium size, and turns bold with an underline on hover.
             Search Bar: Located at the top-right corner, the search bar has a placeholder text "Search..." and a magnifying glass icon.
             Main Content Area:
             
             Hero Section: Spanning the top of the main content, a large banner image of a cityscape with an overlaying text "Welcome to Our Website" in white, bold, and a larger font size. Below this, a smaller subtitle reads "Your source for the latest updates" in italic.
             Article Section: Below the hero section, a two-column layout displays the latest articles. Each column features a thumbnail image on the left, with an article title in bold, a snippet of text, and a "Read More" link in blue on the right.
             Embedded Video: Further down, an embedded YouTube video player showcases a featured video with a play button overlay.
             Sidebar:
             
             Ads: The top of the sidebar features a rectangular ad banner with animated content promoting a sale on electronics.
             Popular Posts: Below the ad, a list of links to popular blog posts with thumbnail images and brief descriptions.
             Footer:
             
             Social Media Links: Icons for Facebook, Twitter, Instagram, and LinkedIn are positioned on the left, each in their respective brand colors.
             Additional Links: On the right, smaller text links include "Privacy Policy," "Terms of Service," and "Sitemap."
             Copyright Information: Centered at the bottom, a text reads "© 2024 WebSiteName. All rights reserved."
             Interactive Elements:
             
             Buttons: The "Contact" button in the navigation menu is highlighted with a green background and white text. On hover, the background color changes to a darker green.
             Form Elements: A newsletter signup form in the footer includes text fields for "Name" and "Email," and a "Subscribe" button in blue.
             Colors and Themes:
             
             Primary Colors: The website uses a palette of blue, white, and grey. The background color is a light grey, with content areas in white and text in dark grey.
             Font Styles: The primary font is a modern sans-serif, with headers in bold and body text in regular weight.
             Additional Details:

             Pop-up Notification: A small pop-up at the bottom-right corner offers a discount code for new subscribers, with a close button in the top-right corner of the pop-up.`

export const getPrompt = (promptType: string) => {
    //switch statement to determine which prompt to return
    switch (promptType) {
        case "header":
            return headerPrompt;
        case "mainContent":
            return mainContentPrompt;
        case "sidebarContent":
            return sidebarContentPrompt;
        case "footerDetails":
            return footerDetailsPrompt;
        case "interactiveElements":
            return interactiveElementsPrompt;
        case "colorsAndThemes":
            return colorsAndThemesPrompt;
        case "additionalDetails":
            return additionalDetailsPrompt;
        case "example":
            return examplePrompt;
        case "example2":
            return examplePrompt2;
        default:
            return '';
    }
}
