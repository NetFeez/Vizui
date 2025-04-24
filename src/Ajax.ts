/**
 * @author NetFeez <netfeez.dev@gmail.com>.
 * @description add ajax utilities to vizui.
 * @module vizui
 * @license Apache-2.0
 */
export namespace Ajax {
    export type method = 'GET' | 'POST' | 'PUT' | 'DELETE';
    export interface toFormData {
        [key: string]: string | File;
    }
}
export class Ajax {
    /**
     * perform a ajax request to the given url.
     * @param url the url to perform the request.
     * @param method the http method to use.
     * @param data the data to send with the request.
     * @returns a promise that resolves with the response text.
     */
    public static query(url: string, method?: Ajax.method, data?: Ajax.toFormData): Promise<string> {
        return new Promise((resolve, reject) => {
            let query = new XMLHttpRequest;
            query.open(method ? method : 'GET', url);
            query.addEventListener('error', (error) => {
                reject(new Error('the request failed:', { cause: error }));
            });
            query.addEventListener('readystatechange', () => {
                if (query.readyState == 4 && query.status == 200) {
                    resolve(query.responseText);
                }
            });
            if (data) query.send(this.formData(data));
            else query.send();
        });
    };
    /**
     * convert a object to a FormData object.
     * @param data the object to convert.
     * @returns a FormData object.
     */
    public static formData(data: Ajax.toFormData): FormData {
        let Form = new FormData;
        for (let key in data) {
            Form.append(key, data[key]);
        }
        return Form;
    }

}
export default Ajax;
