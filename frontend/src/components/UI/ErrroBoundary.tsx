import React from 'react';
import { Banner } from '@neo4j-ndl/react';

export default class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, errorMessage: '', errorName: '' };

  static getDerivedStateFromError(_error: unknown) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ ...this.state, errorMessage: error.message, errorName: error.name });
    
    console.group('🚨 ERROR BOUNDARY CAUGHT AN ERROR 🚨');
    console.error('Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Parse the stack trace to identify the exact line and function where error occurred
    const stackLines = error.stack?.split('\n') || [];
    const relevantStackLine = stackLines.find(line => 
      line.includes('.tsx') || line.includes('.ts') || line.includes('.jsx') || line.includes('.js')
    );
    
    if (relevantStackLine) {
      console.error('🎯 ERROR LOCATION:', relevantStackLine.trim());
    }
    
    // Enhanced debugging for array/undefined issues
    if (error.message.includes('includes') || error.message.includes('undefined') || error.message.includes('reading')) {
      console.group('🔍 DETAILED DIAGNOSTIC INFORMATION');
      
      // Environment variables analysis
      console.group('🌍 Environment Variables Analysis');
      const criticalEnvVars = [
        'VITE_REACT_APP_SOURCES',
        'VITE_LLM_MODELS', 
        'VITE_LLM_MODELS_PROD',
        'VITE_CHAT_MODES',
        'VITE_SKIP_AUTH',
        'VITE_ENV',
        'NODE_ENV'
      ];
      
      criticalEnvVars.forEach(envVar => {
        const value = process.env[envVar];
        const status = value === undefined ? '❌ UNDEFINED' : 
                      value === null ? '⚠️ NULL' : 
                      value === '' ? '⚠️ EMPTY' : '✅ SET';
        console.log(`${status} ${envVar}:`, value, `(type: ${typeof value})`);
      });
      console.groupEnd();
      
      // Constants analysis
      console.group('📊 Constants Analysis');
      try {
        const Constants = require('../../utils/Constants');
        const constantsToCheck = ['APP_SOURCES', 'llms', 'prodllms', 'PRODMODLES', 'chatModeLables'];
        
        constantsToCheck.forEach(constName => {
          const value = Constants[constName];
          const isArray = Array.isArray(value);
          const status = value === undefined ? '❌ UNDEFINED' : 
                        value === null ? '⚠️ NULL' : 
                        !isArray ? '⚠️ NOT ARRAY' : '✅ ARRAY';
          console.log(`${status} ${constName}:`, value, `(isArray: ${isArray}, length: ${isArray ? value.length : 'N/A'})`);
        });
      } catch (constError) {
        console.error('❌ Failed to load Constants:', constError);
      }
      console.groupEnd();
      
      // Memory and runtime analysis
      console.group('🧠 Runtime Analysis');
      console.log('Available global objects:', Object.keys(window).filter(key => key.startsWith('process') || key.startsWith('env')));
      console.log('Process env keys count:', Object.keys(process.env).length);
      console.log('Local storage keys:', Object.keys(localStorage));
      console.groupEnd();
      
      // Try to identify the exact undefined property
      const errorParts = error.message.split(' ');
      const potentialProperty = errorParts.find(part => part.includes("'") && part.includes('includes'));
      if (potentialProperty) {
        console.log('🎯 Suspected undefined property:', potentialProperty);
      }
      
      console.groupEnd(); // End detailed diagnostic
    }
    
    console.groupEnd(); // End main error group
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
                  : this.state.errorMessage?.includes('includes') && this.state.errorMessage?.includes('undefined')
                    ? `🔧 Configuration Issue Detected: This error suggests that required environment variables are missing or incorrectly configured. Open your browser's Developer Console (F12) and look for the detailed diagnostic information with 🚨 and 🔍 icons. This will tell you exactly which variables need to be set. Original error: ${this.state.errorMessage}`
                    : this.state.errorMessage?.includes('reading') && this.state.errorMessage?.includes('undefined')
                      ? `🔧 Runtime Configuration Error: A required configuration value is undefined. Open Developer Console (F12) to see detailed diagnostics. Look for messages with 🚨 and 🔍 icons that will identify the missing configuration. Error: ${this.state.errorMessage}`
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
                : (this.state.errorMessage?.includes('includes') || this.state.errorMessage?.includes('reading')) && this.state.errorMessage?.includes('undefined')
                  ? [
                      {
                        label: 'Open Diagnostics (F12)',
                        onClick: () => {
                          alert('Press F12 to open Developer Tools, then click Console tab to see detailed diagnostic information marked with 🚨 and 🔍 icons.');
                        },
                      },
                      {
                        label: 'Documentation',
                        href: 'https://github.com/neo4j-labs/llm-graph-builder',
                        target: '_blank',
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
