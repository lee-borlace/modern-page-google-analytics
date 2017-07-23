import pnp from 'sp-pnp-js';

/* Functionality to read from site collection-level Configuration list. */
export class SpConfiguration {

    // get specified key from config, cache in local storage with same key, return it via a promise. Optional expiry date.
    public static getAndCacheConfigValue(key: string, expiry?: Date): Promise<string> {
        return new Promise<string>((resolve, reject) => {

            /* TODO - this could be simpler using pnp.storage.local.getorput() but it doesn't
            seem to like calling other PnP code from its getter. */

            var value: string;

            if (pnp.storage.local.enabled) {

                value = pnp.storage.local.get(key);

                // found value in cache
                if (value) {
                    console.log(`getAndCacheConfigValue() : value for ${key} found in cache : ${value}.`);

                    resolve(value);
                } else {

                    console.log(`getAndCacheConfigValue() : value for ${key} not found in cache, reading from config instead and caching.`);

                    SpConfiguration.getConfigValue(key)
                        .then((valueRead: string) => {

                            if(expiry) {
                                pnp.storage.local.put(key, valueRead, expiry);
                            } else {
                                pnp.storage.local.put(key, valueRead);
                            }

                            resolve(valueRead);
                        })
                        .catch((error) => { reject(error); });
                }

            } else {
                console.log("getAndCacheConfigValue() : local storage not enabled, reading from config instead.");
                SpConfiguration.getConfigValue(key)
                    .then((valueRead) => {
                        pnp.storage.local.put(key, valueRead);
                        resolve(valueRead);
                    })
                    .catch((error) => { reject(error); });
            }
        });
    }

    // get config value without caching
    public static getConfigValue(key: string): Promise<string> {

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