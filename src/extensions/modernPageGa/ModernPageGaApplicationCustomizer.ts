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

      // get GA tracking ID from config and cache it.
      this.getAndCacheConfigValue(this.GA_KEY)
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

  // get specified key from config, cache in local storage with same key, return it via a promise
  private getAndCacheConfigValue(key: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {

      /* TODO - this could be simpler using pnp.storage.session.getorput() but it doesn't
      seem to like calling other PnP code from its getter. */

      var value: string;

      if (pnp.storage.session.enabled) {

        value = pnp.storage.session.get(key);

        // found value in cache
        if (value) {
          console.log(`getAndCacheConfigValue() : value for ${key} found in cache : ${value}.`);

          resolve(value);
        } else {

          console.log(`getAndCacheConfigValue() : value for ${key} not found in cache, reading from config instead and caching.`);

          this.getConfigValue(key)
            .then((valueRead:string) => {
              pnp.storage.session.put(key, valueRead);
              resolve(valueRead);
            })
            .catch((error) => { reject(error); });
        }

      } else {
        console.log("getAndCacheConfigValue() : session storage not enabled, reading from config instead.");
        this.getConfigValue(key)
          .then((valueRead) => {
            pnp.storage.session.put(key, valueRead);
            resolve(valueRead);
          })
          .catch((error) => { reject(error); });
      }
    });
  }

  // get config value without caching
  private getConfigValue(key: string): Promise<string> {

    return new Promise<string>((resolve, reject) => {

      pnp.sp.site.rootWeb.lists
        .getByTitle("Configuration")
        .getItemsByCAMLQuery({
          ViewXml:
          `<View> 
            <RowLimit>1</RowLimit> 
            <Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>` + key + `</Value></Eq></Where></Query>
            <ViewFields> 
              <FieldRef Name='Value' /> 
            </ViewFields> 
          </View>` })
        .then((items: any[]) => {

          var retVal: string = "";

          if (items.length > 0) {
            retVal = items[0].Value;
          }

          resolve(retVal);
        })
        .catch((error: any) => {
          reject(error);
        });
    });

  }


}


