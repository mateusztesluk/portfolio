import { getConfigUrlSrvMonitor } from 'config';
import HttpService from './HttpService';
import { CreateMonitorPayload, Monitor } from 'shared/interfaces/monitor';

class MonitorService {
  _httpService: HttpService = new HttpService();

  getMonitors() {
    return this._httpService.get(getConfigUrlSrvMonitor('base')).then((response: Monitor[]) => response);
  }

  createMonitor(data: CreateMonitorPayload) {
    return this._httpService.post(getConfigUrlSrvMonitor('base'), data).then((response: Monitor) => response);
  }

  checkMonitor(id: number) {
    return this._httpService.post(getConfigUrlSrvMonitor('check', id), {}).then((response: Monitor) => response);
  }
}

export default MonitorService;
