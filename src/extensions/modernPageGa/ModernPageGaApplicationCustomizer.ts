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

  @override
  public onInit(): Promise<void> {

    pnp.setup({
      spfxContext: this.context
    });

    return new Promise<void>((resolve, reject) => {
      pnp.sp.web.select("AllProperties").expand("AllProperties").get().then(r => {

        this._googleAnalyticsId = r.AllProperties.GoogleAnalyticsId;

        resolve();
      });
    });
  }

  @override
  public onRender(): void {

    if (this._googleAnalyticsId) {

      console.info("Found GoogleAnalyticsId property bag value : " + this._googleAnalyticsId);

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
    else {
      console.warn("Couldn't find GoogleAnalyticsId property bag value");
    }

  }
}
