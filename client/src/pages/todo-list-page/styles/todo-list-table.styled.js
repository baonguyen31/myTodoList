import { Table } from '@/antd-components/table.component';
import { COLORS } from '@/utilities/constants';
import styled from 'styled-components';

export const TableWrapper = styled.div`
  width: 100%;

  @media (max-width: 550px) {
    table {
      width: 34.375rem;
    }
  }
`;

export const StyledTable = styled(Table)`
  margin: 0.5rem;

  .ant-table-container {
    border: 0.0625rem solid var(--divider-color) !important;
    border-radius: 0.5rem;
    overflow: hidden;
    background-color: var(--item-background-color);
    color: var(--primary-text-color);
  }

  .ant-table-thead > tr > th {
    background-color: var(--table-header-background-color) !important;
    color: var(--primary-text-color) !important;
    border-bottom: 0.0625rem solid var(--divider-color) !important;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 0.0625rem solid var(--divider-color) !important;
  }

  .ant-table-tbody > tr:hover > td {
    background-color: var(--row-hover-color) !important;
  }

  .ant-table-row-selected > td {
    background-color: var(--row-hover-color) !important;
  }

  .ant-table-row-popup-active > td {
    background-color: var(--row-hover-color) !important;
  }

  .ant-pagination-prev,
  .ant-pagination-next {
    color: var(--primary-text-color) !important;
    background-color: var(--item-background-color) !important;
  }

  .ant-pagination-item {
    background-color: var(--item-background-color) !important;
  }

  .ant-pagination-item:hover {
    color: var(--primary-text-color) !important;
    border-color: var(--primary-blue-color) !important;
  }

  .ant-pagination-item a {
    color: var(--primary-text-color) !important;
  }

  .ant-pagination-item-active a {
    color: ${COLORS.WHITE} !important;
    background-color: var(--primary-blue-color) !important;
    border-radius: 0.25rem;
    border-color: var(--primary-blue-color) !important;
    height: 1.9rem;
  }

  .ant-pagination-item-link {
    color: var(--primary-text-color) !important;

    &:hover {
      background-color: var(--active-menu-button-color) !important;
    }
  }

  .ant-table-cell {
    background-color: var(--item-background-color) !important;
  }

  .ant-empty-description {
    color: var(--primary-text-color) !important;
  }
`;

export const RowName = styled.div`
  display: flex;
  justify-content: space-between;
`;
