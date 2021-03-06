import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

import FourOhFour from '@/components/404';
import { Project } from '@/store/projects/reducer';
import routes from '@/utils/routes';

const EpicNotFound = ({ project }: { project: Project }) => (
  <FourOhFour
    message={
      <Trans i18nKey="epicNotFound">
        We can’t find the epic you’re looking for. Try{' '}
        <Link to={routes.project_detail(project.slug)}>another epic</Link> from
        that project?
      </Trans>
    }
  />
);

export default EpicNotFound;
