# Google Analytics for Modern SharePoint Online Pages #

## Intro ##
This project is a way to have Google Analytics functionality on modern SPO pages. This uses a preview version of SPFX so is subject to change / breakage!

Note that at time of writing, once the app is added to the app store, the app needs to added to each site you want it to take effect on. The SPFX docco says that in future you will be able to activate just once for the entire site collection.

Note that this SPFX solution will only apply GA to *modern* pages. To apply GA to *classic* pages, a parallel add-in is suggested to globally inject GA tracking code into the JS for each page based on the same configuration. It would be nice in future if one app could do both.

## Prerequisites
- At time of writing, SPFX Extensions are in preview. Make sure you have a _development_ SPO tenant. A development site collection on a non-development tenant won't do it. Best bet is to sign up for one [here](https://portal.microsoftonline.com/Signup/MainSignUp.aspx?OfferId=6881A1CB-F4EB-4db3-9F18-388898DAF510&DL=DEVELOPERPACK).
- Start [here](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions) to set up your dev environment.

## Getting things up and running
1. Clone the repo from github, open a Node command prompt and cd to the location you cloned to.
2. Run `npm install` to install packages.

## Configuring SPO for Google Analytics
The way the solution works is for the Google Analytics tracking code to be stored in a configuration list at the site collection root, in an entry with title "GoogleAnalyticsId". Property bags would otherwise have been used, but these are not available in modern SPO sites with NoScript turned on. The config list has mandatory Title and Value fields, both single line of text. 

The script *provisioning\create-configList.ps1* creates the config list and inserts the required entry. Note this requires PnP Powershell module to be installed. See [here](https://github.com/SharePoint/PnP-PowerShell).

Usage :

```powershell
.\create-configList.ps1 -siteCollectionUrl <site collection root URL> -gaId "<google tracking ID>"
```

## Building and running (hosted from localhost)
With this option you host the relevant SPFX JS files from localhost. This is built into the app which is deployed to SPO, so you need to be running the solution locally for it to work.

Follow the instructions [here](https://dev.office.com/sharepoint/docs/spfx/extensions/get-started/serving-your-extension-from-sharepoint) to build and deploy. Start at section *"Deploy the extension to SharePoint Online and host JavaScript from local host"*.

1. `gulp bundle`
2. `gulp package-solution`
3. Upload the app package *modern-page-ga.sppkg* to app catalog (you can find it in sharepoint/solution folder)
4. Install the app "GA for Modern Sites" on sites to take effect on
5. `gulp serve --nobrowser` - this is needed to make sure the SPFX JS for the app can be found!
6. Now start hitting pages to capture GA data! Couple of points :
    1. At time of writing the SPFX extension only takes effect on modern pages, Site Contents, and modern list view pages.
    2. It may take a few hours for data to become visible on your GA account. Going to "REAL-TIME" can be a good place to see data as it comes through. You can tell if your page is hitting GA by opening it it Chrome with the dev toolbar open, going to the Network tab and filtering by "google". If things are working, you'll see 2 requests once the page is loaded - one to "analytics.js", and one to "collect".

## Building and running (hosted from CDN)
With this option the relevant SPFX JS files are hosed in a CDN pointed to SPO, so you don't need to be hosting them locally. At this point the app is properly deployed. At time of writing you can only use a CDN which points to SPO (see the article below). Hopefully in future it will be possible to host in a general Azure CDN.

See [this link](https://dev.office.com/sharepoint/docs/spfx/extensions/get-started/hosting-extension-from-office365-cdn) for instructions.

Note that *config/write-manifests.json* isn't checked into (and is ignored by) Github so you will need to create your own with your details as described in the MS docco.

```json
{
  "cdnBasePath": "https://publiccdn.sharepointonline.com/yourtenant.sharepoint.com/sites/yoursite/yourlibrary/yourfolder"
}
```

1. `gulp bundle --ship`
2. `gulp package-solution --ship`
3. Re-upload app to app catalog.
4. Re-copy files from *temp/deploy* to the CDN folder created previously 

## How it works
The project builds an app which can be uploaded to the app catalog. When it is installed on a SP site, the various types of pages which SPFX extensions apply to (modern pages, Site Contents, and modern list view pages) will have the extension take effect. 

The main logic is in `ModernPageGaApplicationCustomizer.onInit()` (to read GA ID from config) and `ModernPageGaApplicationCustomizer.onRender()` (to output the tracking code onto the page). 

The actual code output onto the page in `onRender()` is a slightly tweaked version of the standard GA JS snippet. The *google.analytics* Typescript types are referenced in *tsconfig.json*, which is how `ga` resolves. Could have just made `ga` an `any` variable instead of doing that if you really hate strong typing.

The code to read from the config lists and cache the result in localbrowser  storage uses the *PnP-JS-Core* typings (wrapping https://github.com/SharePoint/PnP-JS-Core) to make things easier than manual REST calls.
