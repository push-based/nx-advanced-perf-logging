import { basename } from 'path';
import { CPUProfile, CpuProfileInfo } from '../cpu/cpuprofile.types';
import {
  CpuProfilerStartProfilingEvent,
  CpuProfilerStopProfilingEvent,
  ProcessNameEvent,
  ProfileChunkEvent,
  ProfileEvent,
  ThreadNameEvent,
  TraceEvent,
  TracingStartedInBrowserEvent,
  TraceMetadata,
  CompleteEvent,
} from './traceprofile.types';

export function getCpuProfilerStartProfilingEvent(
  pid: number,
  tid: number,
  startTime: number
): CpuProfilerStartProfilingEvent {
  return {
    cat: 'v8',
    name: 'CpuProfiler::StartProfiling',
    dur: 0,
    ph: 'X',
    pid,
    tid,
    ts: startTime,
    args: {
      data: {
        startTime,
      },
    },
  };
}

export function getProfileEvent(
  pid: number,
  tid: number,
  startTime: number,
  id?: string
): ProfileEvent {
  return {
    cat: 'v8.cpu_profiler',
    id: id ? `0x${id}` : `0x${pid}${tid}`,
    name: 'Profile',
    ph: 'P',
    pid,
    tid,
    ts: startTime,
    args: {
      data: {
        startTime,
      },
    },
  };
}

export function getProfileChunkEvent(
  pid: number,
  tid: number,
  startTime: number,
  id: string,
  cpuProfile: Pick<CPUProfile, 'nodes' | 'samples'>,
  timeDeltas: number[] | undefined
): ProfileChunkEvent {
  return {
    cat: 'v8.cpu_profiler',
    name: 'ProfileChunk',
    id: `0x${id}`,
    ph: 'P',
    pid,
    tid,
    ts: startTime,
    args: {
      data: {
        cpuProfile: {
          nodes: cpuProfile.nodes,
          samples: cpuProfile.samples,
        },
        timeDeltas,
      },
    },
  };
}

export function getCpuProfilerStopProfilingEvent(
  pid: number,
  tid: number,
  endTime: number
): CpuProfilerStopProfilingEvent {
  return {
    cat: 'v8',
    name: 'CpuProfiler::StopProfiling',
    dur: 0,
    ph: 'X',
    pid,
    tid,
    ts: endTime,
    args: {
      data: {
        endTime,
      },
    },
  };
}

export function getThreadNameTraceEvent(
  pid: number,
  tid: number,
  name: string
): ThreadNameEvent {
  return {
    cat: '__metadata',
    name: 'thread_name',
    ph: 'M',
    pid,
    tid,
    ts: 0,
    args: {
      name,
    },
  };
}

export function getProcessNameTraceEvent(
  pid: number,
  tid: number,
  name: string
): ProcessNameEvent {
  return {
    cat: '__metadata',
    name: 'process_name',
    ph: 'M',
    pid,
    tid,
    ts: 0,
    args: {
      name,
    },
  };
}

export function getRunTaskTraceEvent(
  pid: number,
  tid: number,
  opt: {
    ts: number;
    dur: number;
  }
): TraceEvent {
  const { ts, dur } = opt;
  return {
    args: {},
    cat: 'devtools.timeline',
    dur,
    name: 'RunTask',
    ph: 'X',
    pid,
    tid,
    ts,
  };
}

export function getFrameTreeNodeId(pid: number, tid: number): number {
  return parseInt(`${pid}0${tid}`);
}

export function getFrameName(pid: number, tid: number): string {
  return `FRAME0P${pid}T${tid}`;
}

export function getStartTracing(
  pid: number,
  tid: number,
  opt: {
    traceStartTs: number;
    url: string;
  }
): TracingStartedInBrowserEvent {
  const { traceStartTs, url } = opt;
  const frameTreeNodeId = getFrameTreeNodeId(pid, tid);
  return {
    cat: 'devtools.timeline',
    name: 'TracingStartedInBrowser',
    ph: 'I',
    pid,
    tid,
    ts: traceStartTs,
    s: 't',
    args: {
      data: {
        frameTreeNodeId,
        frames: [
          {
            frame: getFrameName(pid, tid),
            isInPrimaryMainFrame: true,
            isOutermostMainFrame: true,
            name: '',
            processId: pid,
            url,
          },
        ],
        persistentIds: true,
      },
    },
  };
}

export function getCommitLoadTraceEvent(opt: {
  pid: number;
  tid: number;
  ts: number;
  url: string;
}): CompleteEvent {
  const { pid, tid, ts, url } = opt;
  const frame = getFrameName(pid, tid);
  return {
    args: {
      data: {
        frame,
        isMainFrame: true,
        isOutermostMainFrame: true,
        name: '',
        page: frame,
        url,
      },
    },
    cat: 'devtools.timeline',
    dur: 10,
    name: 'CommitLoad',
    ph: 'X',
    pid,
    tid,
    ts,
  };
}

export function getThreadName(info: CpuProfileInfo): string {
  const { sourceFilePath, execArgs } = info;
  return `${basename(sourceFilePath ?? '')} ${execArgs?.join(' ')}`;
}

export function getTraceMetadata(info?: CpuProfileInfo): TraceMetadata {
  const { startDate } = info ?? {};
  return {
    source: 'DevTools',
    startTime: startDate?.toISOString() ?? new Date().toISOString(),
    hardwareConcurrency: 1,
    dataOrigin: 'TraceEvents',
  };
}
