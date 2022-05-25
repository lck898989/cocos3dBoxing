import { Asset, AssetManager, assetManager } from "cc";

/**
 * 
 * 资源管理器 单例
 * 
 */
export class ResourceManager {
    
    /**
     * 加载本地bundle
     * @param  {string} bundleName bundle名称
     * @returns Promise<cc.AssetManager.Bundle>
     */
    public async loadBundle(bundleName: string = 'resources'): Promise<AssetManager.Bundle> {
        return new Promise((resolve,reject) => {
            assetManager.loadBundle(bundleName,(err: Error,bundle: AssetManager.Bundle) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(bundle);
            });
        })
    }

    /**
     * 加载bundle里面的资源
     * @param  {cc.AssetManager.Bundle} bundle budnle资源
     * @param  {string} url 资源在bundle里面的路径
     * @param  {typeofcc.Asset} type 资源的类型
     * @returns Promise
     */
    public async loadAssetInBundle<T extends Asset>(bundle: AssetManager.Bundle,url: string,type: typeof Asset): Promise<T> {
        if(!bundle) return;
        if(!url) return;

        return new Promise((resolve,reject) => {
            bundle.load(url,type,(err: Error,asset: T) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(asset);
            });
        });
    }

    /**
     * 根据bundle名字加载对应的资源
     * @param  {string='resources'} bundleName bundle名字
     * @param  {string} url 资源url
     * @param  {typeofcc.Asset} type 资源类型
     * @returns Promise
     */
    public async loadAseetByBundleName<T extends Asset>(bundleName: string = 'resources',url: string,type: typeof Asset): Promise<T> {
        if(!url) return;
        if(!bundleName) return;

        const bundle = await this.loadBundle(bundleName);
        const asset = await this.loadAssetInBundle<T>(bundle,url,type);

        return asset;
    }

    /**
     * 加载远程资源
     * @param  {string} url string 资源路径
     * @param  {any} opt? 选项 {ext: '.png'} 告诉资源的后缀名是什么
     * @returns Promise
     */
    public async loadRemoteAsset<T extends Asset>(url: string,opt?: any): Promise<T> {
        return new Promise((resolve,reject) => {
            if(opt) {
                assetManager.loadRemote(url,opt,(err: Error,res: T) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            } else {
                assetManager.loadRemote(url,(err: Error,res: T) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            }
        })
    }
}

export const resourceManager = new ResourceManager();