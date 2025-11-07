import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import * as ScriptActions from './actions';
import {AnalysisService} from '../../features/analysis/analysis.service';

@Injectable()
export class ScriptEffects {
  constructor(
    private actions$: Actions,
    private analysisService: AnalysisService
  ) {}

  uploadFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScriptActions.uploadFile),
      switchMap(({ file }) =>
        this.analysisService.analyze(file).pipe(
          map((result) => ScriptActions.analysisSuccess({ result })),
          catchError((error) => of(ScriptActions.uploadFileFailure({ error: error.message || 'Ошибка анализа файла' })))
        )
      )
    )
  );
}
