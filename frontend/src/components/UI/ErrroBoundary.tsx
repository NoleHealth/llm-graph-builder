import React from 'react';
import { Banner } from '@neo4j-ndl/react';

export default class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, errorMessage: '', errorName: '' };

  static getDerivedStateFromError(_error: unknown) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ ...this.state, errorMessage: error.message, errorName: error.name });
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error info:', errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Additional debugging for environment variable issues
    if (error.message.includes('includes') || error.message.includes('undefined')) {
      console.error('Potential environment variable issue detected');
      console.error('Process env:', process.env);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='n-size-full n-flex n-flex-col n-items-center n-justify-center n-rounded-md n-bg-palette-neutral-bg-weak n-box-border'>
          <Banner
            hasIcon={true}
            type='info'
            description={
              this.state.errorMessage === 'Missing required parameter client_id.'
                ? 'Please Provide The Google Client ID For GCS Source'
                : this.state.errorName === 'InvalidCharacterError'
                  ? "We've updated our security measures. To ensure smooth access, please clear your local storage"
                  : `Error: ${this.state.errorMessage || 'Sorry there was a problem loading this page'}`
            }
            title='Something went wrong'
            className='mt-8'
            actions={
              this.state.errorName === 'InvalidCharacterError'
                ? [
                    {
                      label: 'Clear Storage',
                      onClick: () => {
                        localStorage.clear();
                        window.location.reload();
                      },
                    },
                  ]
                : [
                    {
                      label: 'Documentation',
                      href: 'https://github.com/neo4j-labs/llm-graph-builder',
                      target: '_blank',
                    },
                  ]
            }
            usage='inline'
          ></Banner>
        </div>
      );
    }
    return this.props.children;
  }
}
