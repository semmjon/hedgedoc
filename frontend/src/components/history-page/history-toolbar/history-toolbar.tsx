/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HistoryEntryOrigin } from '../../../api/history/types'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { importHistoryEntries, setHistoryEntries } from '../../../redux/history/methods'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../../common/show-if/show-if'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { ClearHistoryButton } from './clear-history-button'
import { ExportHistoryButton } from './export-history-button'
import { HistoryRefreshButton } from './history-refresh-button'
import { HistoryViewModeToggleButton } from './history-view-mode-toggle-button'
import { useSafeRefreshHistoryStateCallback } from './hooks/use-safe-refresh-history-state'
import { ImportHistoryButton } from './import-history-button'
import { KeywordSearchInput } from './keyword-search-input'
import { SortByLastVisitedButton } from './sort-by-last-visited-button'
import { SortByTitleButton } from './sort-by-title-button'
import { TagSelectionInput } from './tag-selection-input'
import { useSyncToolbarStateToUrlEffect } from './toolbar-context/use-sync-toolbar-state-to-url-effect'
import React, { useCallback } from 'react'
import { Button, Col } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export enum ViewStateEnum {
  CARD,
  TABLE
}

/**
 * Renders the toolbar for the history page that contains controls for filtering and sorting.
 */
export const HistoryToolbar: React.FC = () => {
  const { t } = useTranslation()
  const historyEntries = useApplicationState((state) => state.history)
  const userExists = useApplicationState((state) => !!state.user)
  const { showErrorNotification } = useUiNotifications()
  const safeRefreshHistoryState = useSafeRefreshHistoryStateCallback()
  useSyncToolbarStateToUrlEffect()

  const onUploadAllToRemote = useCallback(() => {
    if (!userExists) {
      return
    }
    const localEntries = historyEntries
      .filter((entry) => entry.origin === HistoryEntryOrigin.LOCAL)
      .map((entry) => entry.identifier)
    historyEntries.forEach((entry) => (entry.origin = HistoryEntryOrigin.REMOTE))
    importHistoryEntries(historyEntries).catch((error: Error) => {
      showErrorNotification('landing.history.error.setHistory.text')(error)
      historyEntries.forEach((entry) => {
        if (localEntries.includes(entry.identifier)) {
          entry.origin = HistoryEntryOrigin.LOCAL
        }
      })
      setHistoryEntries(historyEntries)
      safeRefreshHistoryState()
    })
  }, [userExists, historyEntries, showErrorNotification, safeRefreshHistoryState])

  return (
    <Col className={'d-flex flex-row'}>
      <div className={'me-1 mb-1'}>
        <TagSelectionInput />
      </div>
      <div className={'me-1 mb-1'}>
        <KeywordSearchInput />
      </div>
      <div className={'me-1 mb-1'}>
        <SortByTitleButton />
      </div>
      <div className={'me-1 mb-1'}>
        <SortByLastVisitedButton />
      </div>
      <div className={'me-1 mb-1'}>
        <ExportHistoryButton />
      </div>
      <div className={'me-1 mb-1'}>
        <ImportHistoryButton />
      </div>
      <div className={'me-1 mb-1'}>
        <ClearHistoryButton />
      </div>
      <div className={'me-1 mb-1'}>
        <HistoryRefreshButton />
      </div>
      <ShowIf condition={userExists}>
        <div className={'me-1 mb-1'}>
          <Button
            variant={'light'}
            title={t('landing.history.toolbar.uploadAll') ?? undefined}
            onClick={onUploadAllToRemote}>
            <ForkAwesomeIcon icon='cloud-upload' />
          </Button>
        </div>
      </ShowIf>
      <div className={'me-1 mb-1'}>
        <HistoryViewModeToggleButton />
      </div>
    </Col>
  )
}
