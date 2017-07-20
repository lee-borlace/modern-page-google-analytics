import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';

import * as strings from 'modernPageGaStrings';

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

  @override
  public onInit(): Promise<void> {
    return Promise.resolve<void>();
  }

  @override
  public onRender(): void {

    // TODO - get this from property bag.
    var gaId:string = 'UA-102899244-1';

    var d:any = new Date();

    (function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
      (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * d; a = s.createElement(o),
      m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
    })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

    
    ga('create', gaId, 'auto');
    ga('send', 'pageview');


  }
}
