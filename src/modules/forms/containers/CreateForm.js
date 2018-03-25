import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import { Alert } from 'modules/common/utils';
import { Bulk } from 'modules/common/components';
import { queries, mutations } from '../graphql';
import { Form } from '../components';

class CreateFormContainer extends Bulk {
  render() {
    const { brandsQuery, addMutation, addFormMutation, history } = this.props;

    if (brandsQuery.loading) {
      return false;
    }

    const brands = brandsQuery.brands || [];

    const doMutation = (formMutation, mutation, variables) => {
      let formId = '';

      const { form, brandId, name, languageCode, formData } = variables;

      formMutation({
        variables: form
      })
        .then(({ data }) => {
          formId = data.formsAdd._id;

          mutation({
            variables: { formData, brandId, name, languageCode, formId }
          })
            .then(() => {
              Alert.success('Congrats');
              history.push('/forms');
            })
            .catch(error => {
              Alert.error(error.message);
            });
        })

        .catch(error => {
          Alert.error(error.message);
        });
    };

    // save
    const save = doc => {
      return doMutation(addFormMutation, addMutation, doc);
    };

    const updatedProps = {
      ...this.props,
      brands,
      save
    };

    return <Form {...updatedProps} />;
  }
}

CreateFormContainer.propTypes = {
  brandsQuery: PropTypes.object,
  addMutation: PropTypes.func,
  addFormMutation: PropTypes.func
};

const CreateFormWithData = compose(
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.integrationsCreateFormIntegration), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.addForm), {
    name: 'addFormMutation'
  })
)(CreateFormContainer);

const CreateFormIntegrationContainer = props => {
  const queryParams = queryString.parse(props.location.search);

  const extendedProps = { ...props, queryParams };
  return <CreateFormWithData {...extendedProps} />;
};

CreateFormIntegrationContainer.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object
};

export default withRouter(CreateFormIntegrationContainer);
