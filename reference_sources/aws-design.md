<!-- reference_sources/aws-design.md — Primary references for the proposed Lumen AWS security architecture. -->
# AWS design references — 2026-10-13

Owner-directed baseline: separate EC2 service instances behind an ALB, Gait-secured Lumen flagship. Additional controls, managed data tiers and multi-AZ expansion are proposed recommendations. No AWS account was accessed and no infrastructure was provisioned. No compliance claim is made.

Primary AWS documentation consulted:

- https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html
- https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-update-security-groups.html
- https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-listeners.html
- https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-subnets.html
- https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html
- https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html
- https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html
- https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html
- https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html
- https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html
- https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html
- https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html
- https://docs.aws.amazon.com/waf/latest/developerguide/web-acl.html
- https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html
- https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-aws-services.html
- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html
- https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html

Critical limits are explicit in the chapters: ALB all-unhealthy routing can fail open; HTTPS targets do not get certificate validation by ALB; NAT is not destination filtering; a singleton service is not HA; CloudTrail is not clinical audit; SSM port-forward/SSH sessions lack command-content logging; future AI and raw HL7 transport require separate design.
