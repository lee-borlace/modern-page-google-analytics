# Google Analytics for Modern SharePoint Online Pages #

## Intro ##
This project is a way to have Google Analytics functionality on modern SPO pages. This uses a preview version of SPFX so is subject to change / breakage!

## Getting things up and running
1. At time of writing, SPFX Extensions are in preview. Make sure you have a _development_ SPO tenant. A development site collection on a non-development tenant won't do it. Best bet is to sign up for one [here](https://portal.microsoftonline.com/Signup/MainSignUp.aspx?OfferId=6881A1CB-F4EB-4db3-9F18-388898DAF510&DL=DEVELOPERPACK).
2. Start [here](https://dev.office.com/sharepoint/docs/spfx/extensions/overview-extensions) to set up your dev environment.
3. Clone the repo from github, open a Node command prompt and cd to the location you cloned to.
4. Run `npm install` to install packages.
5. Follow the instructions [here](https://dev.office.com/sharepoint/docs/spfx/extensions/get-started/serving-your-extension-from-sharepoint) to build and deploy. Start at section *"Deploy the extension to SharePoint Online and host JavaScript from local host"*. Note that at time of writing, once the app is added to the app store, the app needs to added to each site you want it to take effect on. The SPFX docco says that in future you will be able to activate just once for the entire site collection.
    1. `gulp bundle`
    2. `gulp package-solution`
    3. Upload the app package *modern-page-ga.sppkg* to app catalog (you can find it in sharepoint/solution folder)
    4. Install the app "GA for Modern Sites" on sites to take effect on
    5. `gulp serve --nobrowser` - this is needed to make sure the SPFX JS for the app can be found! Later - will explore hosting on CDN so this is not necessary
