import { Temperature } from '@temperature/model'

function checkStatus(response: Response) {
    if (response.status >= 200 && response.status < 300) {
      // 204 has - by definition - no content, so JSON.parse would fail
      return response.status === 204 ? Promise.resolve(null) : response.json();
    } else {
      return response.text().then(body => {
        throw new Error(`Bad response from server ${response.status} ${body}`);
      });
    }
  }
  
  const JSON_MIME_TYPE = 'application/json';
  
  const defaultOptions: RequestInit = {
    headers: {
      Accept: JSON_MIME_TYPE
    }
  };
  
  export function GetCurrentTemperature(): Promise<Temperature> {
    const url = '/api/temperature/latest';
    return fetch(url, defaultOptions).then(checkStatus)
      .then(responseJson => Temperature.create(responseJson));
  }