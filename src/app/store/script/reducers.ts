import {createReducer, on} from '@ngrx/store';
import * as ScriptActions from './actions';

export interface ScriptState {
  file: File | null;
  loading: boolean;
  error: string | null;
  analysisResult: any | null;
}

export const initialState: ScriptState = {
  file: null,
  loading: false,
  error: null,
  analysisResult: null,
};

export const scriptReducer = createReducer(
  initialState,
  on(ScriptActions.uploadFile, (state, { file }) => ({
    ...state,
    file,
    loading: true,
    error: null
  })),
  on(ScriptActions.uploadFileSuccess, (state, { file }) => ({
    ...state,
    file,
    loading: false,
    error: null
  })),
  on(ScriptActions.uploadFileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(ScriptActions.startAnalysis, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ScriptActions.analysisSuccess, (state, { result }) => ({
    ...state,
    loading: false,
    analysisResult: result,
    error: null
  })),
  on(ScriptActions.analysisFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
