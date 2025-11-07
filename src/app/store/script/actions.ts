import {createAction, props} from '@ngrx/store';

export const uploadFile = createAction('[Script] Upload File', props<{ file: File }>());
export const uploadFileSuccess = createAction('[Script] Upload File Success', props<{ file: File }>());
export const uploadFileFailure = createAction('[Script] Upload File Failure', props<{ error: string }>());

export const startAnalysis = createAction('[Script] Start Analysis', props<{ file: File }>());
export const analysisSuccess = createAction('[Script] Analysis Success', props<{ result: any }>());
export const analysisFailure = createAction('[Script] Analysis Failure', props<{ error: string }>());
