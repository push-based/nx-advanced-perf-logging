import { CpuProfileInfo } from './cpuprofile.types';

export function getSmallestPidTidProfileInfo(
  cpuProfileInfos: CpuProfileInfo[]
): CpuProfileInfo {
  if (cpuProfileInfos.length === 0) {
    throw new Error('No CPU profiles provided');
  }

  return cpuProfileInfos.reduce((best, current) => {
    if (current.pid < best.pid) {
      return current;
    }

    if (current.pid === best.pid && current.tid < best.tid) {
      return current;
    }

    return best;
  });
}
