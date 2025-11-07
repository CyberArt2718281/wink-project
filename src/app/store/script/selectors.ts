import {createFeatureSelector, createSelector} from '@ngrx/store';
import {ScriptState} from './reducers';

export const selectScriptState = createFeatureSelector<ScriptState>('script');

export const selectFile = createSelector(selectScriptState, (state: ScriptState) => state.file);
export const selectLoading = createSelector(selectScriptState, (state: ScriptState) => state.loading);
export const selectError = createSelector(selectScriptState, (state: ScriptState) => state.error);
export const selectAnalysisResult = createSelector(selectScriptState, (state: ScriptState) => state.analysisResult);
