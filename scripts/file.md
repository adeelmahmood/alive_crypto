# Preparing for Engineering Teams Reorganization

Earnest engineering teams will undergo a major restructuring in 2025. Within the Lending Platform, we will transition from domain-separated teams to a layered team structure where a single core platform will support the entire lending platform while separate product-specific teams will drive product initiatives. Beyond the lending platform, this restructuring will provide an opportunity to reshape infrastructure and shared services teams to better serve the company's future needs. This document focuses on preparing for reorganization within the lending platform space.

The reorganization will present new challenges that require clearly defined ownership and processes to maintain smooth operations. We have identified several initiatives that will provide the necessary support for a vertical layered structure of engineering teams to succeed. We will assign a point of contact for each initiative while welcoming feedback and participation from all team members in developing these solutions.

## Codebase Ownership and Separation of Responsibilities

The core platform team will maintain ownership across the entire lending platform, developing features that will be available for all products. They will focus on the platform's resiliency, scalability, and extensibility. This includes developing configuration-based systems to generate apply flows, provide branding support, implement a general-purpose decisioning engine, create a fully customizable checkout process, and support boarding and disbursement operations.

Product teams will focus on developing product flows using the core features provided by the platform team. This includes configuring the full funnel for particular products while combining several features from the lending platform. Product teams may add new features that either reside in a layer above the platform or integrate into the platform depending on their reusability. For features that need to be rolled into the platform, we need a process to ensure compatibility with all other products.

## Business Metrics Ownership

Our current horizontal model of lending platform teams has enabled domain-specific ownership of business metrics and KPIs. A vertical layered structure requires rethinking this KPI ownership split. The proposed model implements shared ownership across KPIs and SLAs. Product teams will focus on business goals and own the business KPIs while sharing responsibility for enhancing the core platform in a product-agnostic manner. This requires product teams to maintain ownership of platform SLAs. Similarly, the core platform team will share responsibility for business outcomes while maintaining platform reliability.

## Release Cadence

Even in our current model, we face challenges with releases. To enable multiple teams to deploy features and fixes within shared codebases simultaneously, we need several improvements and initiatives.

### Development Environment

We need a staging replica environment where teams can frequently deploy and test changes in a shared space. Having a shared environment for end-to-end testing will significantly improve our development process. In our current model, where staging is the only shared environment, developers must push changes without thorough testing, shifting responsibility to the QE team. This creates unnecessary back-and-forth between Dev and QE teams. A shared development environment will address this issue and improve the quality of changes reaching staging.

### Local Environment

Our current local environment provides limited capabilities for developers to test their work. While it supports unit testing, integration testing support remains limited. As we've repeatedly observed, most issues surface around integration points. We can expand local testing capabilities using Docker Compose-based environments. Increasing local testing capacity will reduce upstream testing burden. We can leverage AI agents to create these environments and add self-healing and self-monitoring capabilities. These improvements to the local development environment will enhance code quality and reduce integration issues discovered late in development.

## Feature Flag Management

Our current feature flag implementation using Optimizely lacks structured governance and clear processes. As we move towards a model where multiple teams will be working on shared codebases, we need a more robust feature flag management system. The current ad-hoc approach to feature flag creation and lifecycle management has led to technical debt and coordination challenges. We need defined processes for creating feature flags, removing experimental code once features are stable, and cleaning up obsolete flags. Additionally, when large features require multiple coordinated feature flags, we lack systematic approaches for testing and deployment.

There's an opportunity to evaluate LaunchDarkly as an alternative platform that could provide better tooling for our expanded needs. However, regardless of the chosen platform, we need to establish clear guidelines around feature flag lifecycle management. This includes standardizing naming conventions, implementing systematic cleanup processes, and creating coordination mechanisms for complex feature deployments that span multiple teams. We also need better visibility into active feature flags across environments and their dependencies to prevent unintended interactions between different teams' changes.

## Automated Regression Testing

The transition to a layered team structure makes automated regression testing not just beneficial but essential. Our current manual regression testing process, which takes multiple days for a single round of testing, will become unsustainable with multiple teams deploying changes to shared codebases. Automated regression testing will allow us to maintain quality while significantly reducing the time and effort required for testing cycles.

Beyond time savings, automated regression testing offers strategic advantages in our new structure. We can implement testing checkpoints at multiple stages of our development pipeline - before code commits, during staging deployments, and before production releases. This multi-layer validation approach will help catch issues earlier in the development cycle when they're less costly to fix. Furthermore, automated testing will provide consistent coverage across all products, ensuring that changes from one team don't inadvertently impact features owned by another team. We need to prioritize building this automated regression suite while ensuring it remains maintainable and reliable as our platform evolves.
