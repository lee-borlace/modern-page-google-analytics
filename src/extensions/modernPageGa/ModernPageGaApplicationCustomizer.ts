import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import pnp from 'sp-pnp-js';

import * as strings from 'modernPageGaStrings';

import { SpConfiguration } from '../../SpConfiguration'

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
  readonly DAYS_TO_CACHE_GA_CODE = 14;

  @override
  public onInit(): Promise<void> {

    pnp.setup({
      spfxContext: this.context
    });

    return new Promise<void>((resolve, reject) => {

      // get GA tracking ID from config and cache it.
      SpConfiguration.getAndCacheConfigValue(this.GA_KEY, pnp.util.dateAdd(new Date(), "day", this.DAYS_TO_CACHE_GA_CODE))
        .then((gaId:string) => {
          if (gaId) {
            console.log("Found " + this.GA_KEY + " in config list : " + gaId);
            this._googleAnalyticsId = gaId;
          } else {
            console.warn("Couldn't find " + this.GA_KEY + " in config list.");
          }
          resolve();
        })
        .catch((error: any) => {
          console.error("Error trying to read " + this.GA_KEY + " from config list : " + error.message);
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


}


