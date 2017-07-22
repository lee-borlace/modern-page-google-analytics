import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';

import * as strings from 'modernPageGaStrings';

import pnp from 'sp-pnp-js';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IModernPageGaApplicationCustomizerProperties {
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class ModernPageGaApplicationCustomizer
  extends BaseApplicationCustomizer<IModernPageGaApplicationCustomizerProperties> {

  private _googleAnalyticsId: string;

  readonly GA_KEY: string = "GoogleAnalyticsId";

  @override
  public onInit(): Promise<void> {

    pnp.setup({
      spfxContext: this.context
    });

    return new Promise<void>((resolve, reject) => {

      // Query Configuration list for item with Title of "GoogleAnalyticsId", get the Value. 
      // TODO - this is quick code to read form the list - in future this should be moved to another method or class.
      // TODO - cache the results using pnp.storage.local.getOrPut.
      pnp.sp.site.rootWeb.lists
        .getByTitle("Configuration")
        .getItemsByCAMLQuery({
          ViewXml:
          `<View> 
                  <RowLimit>1</RowLimit> 
                  <Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>` + this.GA_KEY + `</Value></Eq></Where></Query>
                  <ViewFields> 
                    <FieldRef Name='Value' /> 
                  </ViewFields> 
                </View>` })
        .then((items: any[]) => {

          if (items.length > 0) {
            this._googleAnalyticsId = items[0].Value;
            console.log("Found " + this.GA_KEY + " in config list : " + this._googleAnalyticsId);
          }
          else {
            console.warn("Couldn't find " + this.GA_KEY + " in config list.");
          }
          resolve();
        })
        .catch((error: any) => {

          console.error("Error trying to read " + this.GA_KEY + " from config list : " + error.message);

          resolve();
        });
    });
  }

  @override
  public onRender(): void {

    // if GA ID is configured, output GA tracking code.
    if (this._googleAnalyticsId) {
      var d: any = new Date();
      (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
          (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * d; a = s.createElement(o),
          m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
      })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

      ga('create', this._googleAnalyticsId, 'auto');
      ga('send', 'pageview');
    }


  }

  private getConfigValue(key: string): string {
    return "";
  }

}
