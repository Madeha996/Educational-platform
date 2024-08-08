import React from 'react';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import { EditableTable } from '@app/components/tables/editableTable/EditableTable';
import { useTranslation } from 'react-i18next';
import * as S from '@app/components/tables/Tables/Tables.styles';

const NotesManagmentPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle>{t('common.notes-managment')}</PageTitle>
      <S.Card id="editable-table" title={t('common.notes-managment')} padding="1.25rem 1.25rem 0">
        <EditableTable />
      </S.Card>
    </>
  );
};

export default NotesManagmentPage;
