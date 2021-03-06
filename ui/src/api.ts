import { Temperature, Location, Status } from '@temperature/model'

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
  
  export function GetCurrentStatus(): Promise<Status> {
    const url = '/api/status';
    return fetch(url, defaultOptions).then(checkStatus)
      .then(responseJson => Status.create(responseJson));
  }
  
  export function GetLastTemperatures(location: Location): Promise<Temperature[]> {
    const url = `/api/temperatures/${location.serialize()}`;
    return fetch(url.toString(), defaultOptions).then(checkStatus)
      .then(responseJson => {
        if( Array.isArray(responseJson) ) {
          return responseJson.map( elt => Temperature.create(elt));
        } else {
          throw new Error('Expected an array, got ' + responseJson.toString())
        }
      });
  }

  export function GetLastLocations(): Promise<Location[]> {
    const url = `/api/locations`;
    return fetch(url.toString(), defaultOptions).then(checkStatus)
      .then(responseJson => {
        if( Array.isArray(responseJson) ) {
          return responseJson.map( elt => Location.create(elt));
        } else {
          throw new Error('Expected an array, got ' + responseJson.toString())
        }
      });
  }

  export function StartRecording(location: Location): Promise<void> {
    const options: RequestInit = {
      method: 'POST'
    };
    const url = '/api/recording/start/' + location.serialize();
    return fetch(url, options ).then(checkStatus);
  }

  export function StopRecording(): Promise<void> {
    const options: RequestInit = {
      method: 'POST'
    };
    const url = '/api/recording/stop';
    return fetch(url, options ).then(checkStatus);
  }