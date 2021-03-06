import Button from '@salesforce/design-system-react/components/button';
import DataTable from '@salesforce/design-system-react/components/data-table';
import DataTableCell from '@salesforce/design-system-react/components/data-table/cell';
import DataTableColumn from '@salesforce/design-system-react/components/data-table/column';
import ProgressRing from '@salesforce/design-system-react/components/progress-ring';
import classNames from 'classnames';
import i18n from 'i18next';
import { sortBy } from 'lodash';
import React, { ReactNode, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  AssignUserModal,
  GitHubUserAvatar,
} from '@/components/user/githubUser';
import { Task } from '@/store/tasks/reducer';
import { GitHubUser } from '@/store/user/reducer';
import {
  ORG_TYPES,
  OrgTypes,
  REVIEW_STATUSES,
  TASK_STATUSES,
} from '@/utils/constants';
import routes from '@/utils/routes';

type AssignUserAction = ({
  task,
  type,
  assignee,
  shouldAlertAssignee,
}: {
  task: Task;
  type: OrgTypes;
  assignee: GitHubUser | null;
  shouldAlertAssignee: boolean;
}) => void;

interface TableCellProps {
  [key: string]: any;
  className?: string;
  children?: ReactNode;
  item?: Task;
}

interface Props {
  projectSlug: string;
  epicSlug: string;
  tasks: Task[];
  epicUsers: GitHubUser[];
  openAssignEpicUsersModal: () => void;
  assignUserAction: AssignUserAction;
}

const NameTableCell = ({
  projectSlug,
  epicSlug,
  item,
  className,
  children,
  ...props
}: TableCellProps & {
  projectSlug: string;
  epicSlug: string;
}) => (
  <DataTableCell
    {...props}
    className={classNames(className, 'epic-task-name', 'truncated-cell')}
  >
    {projectSlug && epicSlug && item && (
      <Link to={routes.task_detail(projectSlug, epicSlug, item.slug)}>
        {children}
      </Link>
    )}
  </DataTableCell>
);
NameTableCell.displayName = DataTableCell.displayName;

const StatusTableCell = ({ item, className, ...props }: TableCellProps) => {
  /* istanbul ignore if */
  if (!item) {
    return null;
  }
  const status =
    item.review_valid && item.status !== TASK_STATUSES.COMPLETED
      ? item.review_status
      : item.status;
  let displayStatus, icon;
  switch (status) {
    case TASK_STATUSES.PLANNED:
      displayStatus = i18n.t('Planned');
      icon = <ProgressRing value={0} />;
      break;
    case TASK_STATUSES.IN_PROGRESS:
      displayStatus = i18n.t('In Progress');
      icon = <ProgressRing value={40} flowDirection="fill" theme="active" />;
      break;
    case TASK_STATUSES.COMPLETED:
      displayStatus = i18n.t('Complete');
      icon = <ProgressRing value={100} theme="complete" hasIcon />;
      break;
    case REVIEW_STATUSES.CHANGES_REQUESTED:
      displayStatus = i18n.t('Changes Requested');
      icon = (
        <ProgressRing value={60} flowDirection="fill" theme="warning" hasIcon />
      );
      break;
    case REVIEW_STATUSES.APPROVED:
      displayStatus = i18n.t('Approved');
      icon = <ProgressRing value={80} flowDirection="fill" />;
      break;
  }
  return (
    <DataTableCell
      {...props}
      title={displayStatus || status}
      className={classNames(className, 'epic-task-status', 'status-cell')}
    >
      {icon}
      <span className="slds-m-left_x-small status-cell-text">
        {displayStatus || status}
      </span>
    </DataTableCell>
  );
};
StatusTableCell.displayName = DataTableCell.displayName;

const AssigneeTableCell = ({
  type,
  epicUsers,
  openAssignEpicUsersModal,
  assignUserAction,
  item,
  className,
  children,
  ...props
}: TableCellProps & {
  type: OrgTypes;
  epicUsers: GitHubUser[];
  openAssignEpicUsersModal: () => void;
  assignUserAction: AssignUserAction;
  children?: GitHubUser | null;
}) => {
  const [assignUserModalOpen, setAssignUserModalOpen] = useState(false);

  const openAssignUserModal = () => {
    setAssignUserModalOpen(true);
  };
  const closeAssignUserModal = () => {
    // setAssigneeSelection(null);
    setAssignUserModalOpen(false);
  };
  const handleEmptyMessageClick = useCallback(() => {
    closeAssignUserModal();
    openAssignEpicUsersModal();
  }, [openAssignEpicUsersModal]);

  const doAssignUserAction = useCallback(
    (assignee: GitHubUser | null, shouldAlertAssignee: boolean) => {
      /* istanbul ignore if */
      if (!item || !type) {
        return;
      }
      assignUserAction({ task: item, type, assignee, shouldAlertAssignee });
    },
    [assignUserAction, item, type],
  );
  /* istanbul ignore if */
  if (!item) {
    return null;
  }
  let contents, title;
  if (children) {
    contents = <GitHubUserAvatar user={children} />;
    title = children.login;
  } else {
    let assignedUser;
    switch (type) {
      case ORG_TYPES.DEV:
        title = i18n.t('Assign Developer');
        assignedUser = item.assigned_dev;
        break;
      case ORG_TYPES.QA:
        title = i18n.t('Assign Tester');
        assignedUser = item.assigned_qa;
        break;
    }

    contents = (
      <>
        <Button
          className="slds-m-left_xx-small"
          assistiveText={{ icon: title }}
          iconCategory="utility"
          iconName="adduser"
          iconSize="medium"
          variant="icon"
          title={title}
          onClick={openAssignUserModal}
        />
        <AssignUserModal
          allUsers={epicUsers}
          selectedUser={assignedUser}
          orgType={type}
          isOpen={assignUserModalOpen}
          emptyMessageText={i18n.t('Add Epic Collaborators')}
          emptyMessageAction={handleEmptyMessageClick}
          onRequestClose={closeAssignUserModal}
          setUser={doAssignUserAction}
        />
      </>
    );
  }
  return (
    <DataTableCell
      {...props}
      title={title}
      className={classNames(className, 'epic-task-assignee')}
    >
      {contents}
    </DataTableCell>
  );
};
AssigneeTableCell.displayName = DataTableCell.displayName;

const TaskTable = ({
  projectSlug,
  epicSlug,
  tasks,
  epicUsers,
  openAssignEpicUsersModal,
  assignUserAction,
}: Props) => {
  const statusOrder = {
    [TASK_STATUSES.IN_PROGRESS]: 1,
    [TASK_STATUSES.PLANNED]: 2,
    [TASK_STATUSES.COMPLETED]: 3,
  };
  const taskDefaultSort = sortBy(tasks, [
    (item) => statusOrder[item.status],
    'name',
  ]);
  return (
    <DataTable items={taskDefaultSort} id="epic-tasks-table" noRowHover>
      <DataTableColumn
        key="name"
        label={i18n.t('Task')}
        property="name"
        width="65%"
        primaryColumn
      >
        <NameTableCell projectSlug={projectSlug} epicSlug={epicSlug} />
      </DataTableColumn>
      <DataTableColumn
        key="status"
        label={i18n.t('Status')}
        property="status"
        width="20%"
      >
        <StatusTableCell />
      </DataTableColumn>
      <DataTableColumn
        key="assigned_dev"
        label={i18n.t('Developer')}
        property="assigned_dev"
        width="15%"
      >
        <AssigneeTableCell
          type={ORG_TYPES.DEV}
          epicUsers={epicUsers}
          openAssignEpicUsersModal={openAssignEpicUsersModal}
          assignUserAction={assignUserAction}
        />
      </DataTableColumn>
      <DataTableColumn
        key="assigned_qa"
        label={i18n.t('Tester')}
        property="assigned_qa"
        width="15%"
      >
        <AssigneeTableCell
          type={ORG_TYPES.QA}
          epicUsers={epicUsers}
          openAssignEpicUsersModal={openAssignEpicUsersModal}
          assignUserAction={assignUserAction}
        />
      </DataTableColumn>
    </DataTable>
  );
};

export default TaskTable;
